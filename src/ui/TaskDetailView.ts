// ============================================================
// TaskDetailView.ts – Vollständige Aufgaben-Bearbeitung
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { App, Setting, Notice } from "obsidian";
import {
    TaskModel,
    Priority,
    Status,
    RecurrenceInterval,
    ReminderTime,
    formatDate,
    parseDate,
    getPercentColor,
    getPercentCssClass
} from "../core/TaskModel";
import { TaskManager } from "../core/TaskManager";
import { TagStore } from "../core/TagStore";
import { ImageStorage } from "../storage/ImageStorage";
import { PluginSettings } from "../settings/SettingsModel";
import { RecurrenceEngine } from "../core/RecurrenceEngine";
import { t } from "../i18n/i18n";

export interface TaskDetailCallbacks {
    onBack: () => void;
    onDeleted: () => void;
    onUpdated: () => void;
}

export class TaskDetailView {
    private container: HTMLElement;
    private app: App;
    private task: TaskModel;
    private taskManager: TaskManager;
    private tagStore: TagStore;
    private imageStorage: ImageStorage;
    private recurrenceEngine: RecurrenceEngine;
    private getSettings: () => PluginSettings;
    private callbacks: TaskDetailCallbacks;

    constructor(
        container: HTMLElement,
        app: App,
        task: TaskModel,
        taskManager: TaskManager,
        tagStore: TagStore,
        imageStorage: ImageStorage,
        recurrenceEngine: RecurrenceEngine,
        getSettings: () => PluginSettings,
        callbacks: TaskDetailCallbacks
    ) {
        this.container = container;
        this.app = app;
        this.task = task;
        this.taskManager = taskManager;
        this.tagStore = tagStore;
        this.imageStorage = imageStorage;
        this.recurrenceEngine = recurrenceEngine;
        this.getSettings = getSettings;
        this.callbacks = callbacks;
    }

    render(): void {
        this.container.empty();
        this.container.addClass("atm-detail-view");


        // ---- Header mit Zurück und Löschen ----
        const header = this.container.createDiv({ cls: "atm-detail-header" });
        const backBtn = header.createEl("button", {
            text: t("detail.back"),
            cls: "atm-btn-back"
        });
        backBtn.addEventListener("click", () => this.callbacks.onBack());

        const deleteBtn = header.createEl("button", {
            text: t("detail.delete"),
            cls: "atm-btn-delete"
        });
        deleteBtn.addEventListener("click", () => {
            void (async () => {
                await this.taskManager.delete(this.task);
                this.callbacks.onDeleted();
            })();
        });


        // ---- Formular ----
        const form = this.container.createDiv({ cls: "atm-detail-form" });

        // Aufgabe (Titel)
        new Setting(form)
            .setName(t("task.field.aufgabe"))
            .addText((text) =>
                text.setValue(this.task.aufgabe).onChange(async (v) => {
                    await this.taskManager.update(this.task, {
                        aufgabe: v
                    });
                })
            );

        // Bezeichnung
        new Setting(form)
            .setName(t("task.field.bezeichnung"))
            .addText((text) =>
                text.setValue(this.task.bezeichnung).onChange(async (v) => {
                    await this.taskManager.update(this.task, {
                        bezeichnung: v
                    });
                })
            );

        // Priorität
        new Setting(form)
            .setName(t("task.field.prioritaet"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption(String(Priority.HIGHEST), t("task.priority.highest"))
                    .addOption(String(Priority.HIGH), t("task.priority.high"))
                    .addOption(String(Priority.NORMAL), t("task.priority.normal"))
                    .addOption(String(Priority.LOW), t("task.priority.low"))
                    .setValue(String(this.task.prioritaet))
                    .onChange(async (v) => {
                        await this.taskManager.update(this.task, {
                            prioritaet: parseInt(v) as Priority
                        });
                    })
            );

        // Status
        new Setting(form)
            .setName(t("task.field.status"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption(Status.OPEN, t("task.status.open"))
                    .addOption(Status.IN_PROGRESS, t("task.status.inprogress"))
                    .addOption(Status.COMPLETED, t("task.status.completed"))
                    .setValue(this.task.status)
                    .onChange(async (v) => {
                        const oldStatus = this.task.status;
                        await this.taskManager.update(this.task, {
                            status: v as Status
                        });
                        // Wiederkehrende Aufgabe prüfen
                        if (
                            v === (Status.COMPLETED as string) &&
                            oldStatus !== Status.COMPLETED
                        ) {

                            await this.recurrenceEngine.check(this.task);
                            if (this.task.wiederkehrend.aktiv) {
                                new Notice(t("notification.recurrence"), 5000);
                            }
                        }
                        this.render(); // Detail-Ansicht aktualisieren
                    })
            );

        // Anfangsdatum
        new Setting(form)
            .setName(t("task.field.anfangsdatum"))
            .addText((text) => {
                text.inputEl.type = "date";
                text.setValue(formatDate(this.task.anfangsdatum, "yyyy-MM-dd"));
                text.onChange(async (v) => {
                    const date = parseDate(v);
                    if (date) {
                        await this.taskManager.update(this.task, {
                            anfangsdatum: date
                        });
                    }
                });
            });

        // Fälligkeitsdatum
        new Setting(form)
            .setName(t("task.field.faelligkeitsdatum"))
            .addText((text) => {
                text.inputEl.type = "date";
                text.setValue(
                    this.task.faelligkeitsdatum
                        ? formatDate(this.task.faelligkeitsdatum, "yyyy-MM-dd")
                        : ""
                );
                text.onChange(async (v) => {
                    await this.taskManager.update(this.task, {
                        faelligkeitsdatum: v ? parseDate(v) : null
                    });
                });
            });

        // Abschlussdatum (nur Anzeige)
        new Setting(form)
            .setName(t("task.field.abschlussdatum"))
            .addText((text) => {
                text.inputEl.type = "date";
                text.setValue(
                    this.task.abschlussdatum
                        ? formatDate(this.task.abschlussdatum, "yyyy-MM-dd")
                        : ""
                );
                text.setDisabled(true);
            });

        // % Abgeschlossen – Slider
        const percentSetting = new Setting(form).setName(
            t("task.field.prozent")
        );
        const percentDisplay = percentSetting.controlEl.createEl("span", {
            text: `${this.task.prozent}%`,
            cls: `atm-percent-label ${getPercentCssClass(this.task.prozent)}`
        });
        percentDisplay.addClass("atm-percent-detail-value");
        percentDisplay.setCssProps({
            "--percent-color": getPercentColor(this.task.prozent)
        });


        percentSetting.addSlider((slider) =>
            slider
                .setLimits(0, 100, 5)
                .setValue(this.task.prozent)
                .setDynamicTooltip()
                .onChange(async (v) => {
                    percentDisplay.textContent = `${v}%`;
                    percentDisplay.setCssProps({
                        "--percent-color": getPercentColor(v)
                    });
                    percentDisplay.className = `atm-percent-label atm-percent-detail-value ${getPercentCssClass(v)}`;


                    const oldStatus = this.task.status;
                    await this.taskManager.update(this.task, {
                        prozent: v
                    });

                    // Wiederkehrende Aufgabe prüfen wenn auf 100%
                    if (
                        v >= 100 &&
                        this.task.status === Status.COMPLETED &&
                        oldStatus !== Status.COMPLETED
                    ) {
                        await this.recurrenceEngine.check(this.task);
                        if (this.task.wiederkehrend.aktiv) {
                            new Notice(t("notification.recurrence"), 5000);
                        }
                    }

                    this.render();
                })
        );

        // Tags
        this.renderTagsSection(form);

        // Link
        new Setting(form)
            .setName(t("task.field.link"))
            .addText((text) =>
                text
                    // eslint-disable-next-line obsidian/use-sentence-case
                    .setPlaceholder("https://...")

                    .setValue(this.task.link)
                    .onChange(async (v) => {
                        await this.taskManager.update(this.task, {
                            link: v
                        });
                    })
            );

        // Link-Vorschau (klickbar)
        if (this.task.link) {
            const linkPreview = form.createDiv({ cls: "atm-link-preview" });
            const anchor = linkPreview.createEl("a", {
                text: this.task.link,
                href: this.task.link,
                cls: "atm-link-anchor"
            });
            anchor.setAttr("target", "_blank");
            anchor.setAttr("rel", "noopener noreferrer");
        }

        // Wiederkehrend
        this.renderRecurrenceSection(form);

        // Erinnerung
        this.renderReminderSection(form);

        // Bilder
        this.renderImagesSection(form);

        // Notizen
        new Setting(form)
            .setName(t("task.field.notizen"))
            .addTextArea((area) => {
                area.inputEl.rows = 8;
                area.inputEl.addClass("atm-detail-textarea");
                area.setValue(this.task.notizen || "");
                area.onChange(async (v) => {
                    await this.taskManager.update(this.task, {
                        notizen: v
                    });
                });
            });
    }

    // ---- Tags-Bereich ----
    private renderTagsSection(form: HTMLElement): void {
        const tagsSection = form.createDiv({ cls: "atm-detail-tags-section" });
        tagsSection.createEl("label", {
            text: t("task.field.tags"),
            cls: "atm-detail-label"
        });

        const tagsWrapper = tagsSection.createDiv({
            cls: "atm-detail-tags-wrapper"
        });

        // Bestehende Tags anzeigen
        for (const tag of this.task.tags) {
            const badge = tagsWrapper.createEl("span", {
                cls: "atm-tag-badge atm-tag-removable"
            });
            badge.createEl("span", { text: tag });
            const removeBtn = badge.createEl("span", {
                text: " ×",
                cls: "atm-tag-remove-btn"
            });
            removeBtn.addEventListener("click", () => {
                void (async () => {
                    const newTags = this.task.tags.filter((t) => t !== tag);
                    await this.taskManager.update(this.task, { tags: newTags });
                    this.render();
                })();
            });

        }

        // Neuer Tag hinzufügen
        const inputWrapper = tagsWrapper.createDiv({
            cls: "atm-tag-input-wrapper"
        });
        const tagInput = inputWrapper.createEl("input", {
            type: "text",
            placeholder: "Neuer Tag...",
            cls: "atm-tag-input"
        });


        const suggestionsDiv = inputWrapper.createDiv({
            cls: "atm-tag-suggestions"
        });

        tagInput.addEventListener("input", () => {
            suggestionsDiv.empty();
            if (!tagInput.value.trim()) return;

            const suggestions = this.tagStore
                .getSuggestions(tagInput.value)
                .filter((s) => !this.task.tags.includes(s))
                .slice(0, 5);

            for (const sug of suggestions) {
                const item = suggestionsDiv.createEl("div", {
                    text: sug,
                    cls: "atm-tag-suggestion-item"
                });
                item.addEventListener("click", () => {
                    void (async () => {
                        const newTags = [...this.task.tags, sug];
                        await this.taskManager.update(this.task, {
                            tags: newTags
                        });
                        this.render();
                    })();
                });

            }
        });

        tagInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && tagInput.value.trim()) {
                e.preventDefault();
                void (async () => {
                    const newTags = [...this.task.tags, tagInput.value.trim()];
                    await this.taskManager.update(this.task, { tags: newTags });
                    this.render();
                })();
            }
        });

    }

    // ---- Wiederkehrend-Bereich ----
    private renderRecurrenceSection(form: HTMLElement): void {
        new Setting(form)
            .setName(t("task.field.wiederkehrend"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("", t("task.recurrence.none"))
                    .addOption(RecurrenceInterval.DAILY, t("task.recurrence.daily"))
                    .addOption(RecurrenceInterval.WEEKLY, t("task.recurrence.weekly"))
                    .addOption(RecurrenceInterval.MONTHLY, t("task.recurrence.monthly"))
                    .addOption(RecurrenceInterval.YEARLY, t("task.recurrence.yearly"))
                    .addOption(RecurrenceInterval.CUSTOM, t("task.recurrence.custom"))
                    .setValue(
                        this.task.wiederkehrend.aktiv && this.task.wiederkehrend.intervall
                            ? this.task.wiederkehrend.intervall
                            : ""
                    )
                    .onChange(async (v) => {
                        if (v) {
                            await this.taskManager.update(this.task, {
                                wiederkehrend: {
                                    aktiv: true,
                                    intervall: v as RecurrenceInterval,
                                    wert: this.task.wiederkehrend.wert || 1,
                                    wochentag: this.task.wiederkehrend.wochentag,
                                    monatstag: this.task.wiederkehrend.monatstag
                                }
                            });
                        } else {
                            await this.taskManager.update(this.task, {
                                wiederkehrend: {
                                    aktiv: false,
                                    intervall: null,
                                    wert: null
                                }
                            });
                        }
                        this.render();
                    })
            );

        // Intervall-Wert (nur wenn aktiv und custom)
        if (this.task.wiederkehrend.aktiv) {
            new Setting(form)
                .setName(t("task.field.intervalValue"))
                .addText((text) => {
                    text.inputEl.type = "number";
                    text.inputEl.min = "1";
                    text.setValue(
                        String(this.task.wiederkehrend.wert || 1)
                    );
                    text.onChange((v) => {
                        const wert = parseInt(v) || 1;
                        void this.taskManager.update(this.task, {
                            wiederkehrend: {
                                ...this.task.wiederkehrend,
                                wert: wert
                            }
                        });
                    });

                });
        }
    }

    // ---- Erinnerung-Bereich ----
    private renderReminderSection(form: HTMLElement): void {
        new Setting(form)
            .setName(t("task.field.erinnerung"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("", t("task.reminder.none"))
                    .addOption(
                        ReminderTime.ONE_DAY_BEFORE,
                        t("task.reminder.1daybefore")
                    )
                    .addOption(
                        ReminderTime.SAME_DAY,
                        t("task.reminder.sameday")
                    )
                    .addOption(
                        ReminderTime.ONE_HOUR_BEFORE,
                        t("task.reminder.1hourbefore")
                    )
                    .addOption(
                        ReminderTime.CUSTOM,
                        t("task.reminder.custom")
                    )
                    .setValue(
                        this.task.erinnerung.aktiv && this.task.erinnerung.zeit
                            ? this.task.erinnerung.zeit
                            : ""
                    )
                    .onChange(async (v) => {
                        if (v) {
                            await this.taskManager.update(this.task, {
                                erinnerung: {
                                    aktiv: true,
                                    zeit: v as ReminderTime,
                                    customMinutes:
                                        this.task.erinnerung.customMinutes
                                }
                            });
                        } else {
                            await this.taskManager.update(this.task, {
                                erinnerung: {
                                    aktiv: false,
                                    zeit: null
                                }
                            });
                        }
                        this.render();
                    })
            );

        // Custom Minuten (nur bei Custom)
        if (
            this.task.erinnerung.aktiv &&
            this.task.erinnerung.zeit === ReminderTime.CUSTOM
        ) {
            new Setting(form)
                .setName(t("task.field.reminderMinutes"))
                .addText((text) => {
                    text.inputEl.type = "number";
                    text.inputEl.min = "1";
                    text.setValue(
                        String(this.task.erinnerung.customMinutes || 60)
                    );
                    text.onChange(async (v) => {
                        const minutes = parseInt(v) || 60;
                        await this.taskManager.update(this.task, {
                            erinnerung: {
                                ...this.task.erinnerung,
                                customMinutes: minutes
                            }
                        });
                    });
                });
        }
    }

    // ---- Bilder-Bereich ----
    private renderImagesSection(form: HTMLElement): void {
        const imageSection = form.createDiv({ cls: "atm-detail-images-section" });
        imageSection.createEl("label", {
            text: t("task.field.bilder"),
            cls: "atm-detail-label"
        });

        const gallery = imageSection.createDiv({ cls: "atm-image-gallery" });

        // Bestehende Bilder anzeigen
        for (const imagePath of this.task.bilder) {
            const imgWrapper = gallery.createDiv({ cls: "atm-image-wrapper" });

            const uri = this.imageStorage.getImageUri(imagePath);
            if (uri) {
                const img = imgWrapper.createEl("img", {
                    cls: "atm-image-thumbnail"
                });
                img.src = uri;
                img.alt = imagePath;

                // Klick öffnet Bild in Obsidian
                img.addEventListener("click", () => {
                    const file = this.app.vault.getAbstractFileByPath(imagePath);
                    if (file) {
                        void this.app.workspace.openLinkText(imagePath, "", true);
                    }

                });
            } else {
                imgWrapper.createEl("span", {
                    text: imagePath,
                    cls: "atm-image-path"
                });
            }

            // Entfernen-Button
            const removeBtn = imgWrapper.createEl("button", {
                text: t("detail.image.remove"),
                cls: "atm-btn-image-remove"
            });
            removeBtn.addEventListener("click", () => {
                void (async () => {
                    const newBilder = this.task.bilder.filter(
                        (b) => b !== imagePath
                    );
                    await this.taskManager.update(this.task, {
                        bilder: newBilder
                    });
                    this.render();
                })();
            });

        }

        // Upload-Button
        const uploadBtn = imageSection.createEl("button", {
            text: t("detail.image.upload"),
            cls: "atm-btn-image-upload"
        });
        uploadBtn.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.multiple = true;

            fileInput.addEventListener("change", () => {
                void (async () => {
                    if (!fileInput.files) return;

                    const newBilder = [...this.task.bilder];
                    for (let i = 0; i < fileInput.files.length; i++) {
                        const file = fileInput.files[i];
                        try {
                            const savedPath = await this.imageStorage.saveImage(
                                file,
                                this.task.aufgabe
                            );
                            newBilder.push(savedPath);
                        } catch (e) {
                            console.error("Error uploading image:", e);
                        }
                    }

                    await this.taskManager.update(this.task, {
                        bilder: newBilder
                    });
                    this.render();
                })();
            });


            fileInput.click();
        });
    }
}
