// ============================================================
// TaskCreateModal.ts – Modal für neue Aufgabe erstellen
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { App, Modal, Setting } from "obsidian";
import {
    TaskModel,
    Priority,
    RecurrenceInterval,
    ReminderTime,
    createDefaultTask,
    parseDate
} from "../core/TaskModel";
import { TaskManager } from "../core/TaskManager";
import { TagStore } from "../core/TagStore";
import { PluginSettings } from "../settings/SettingsModel";
import { t } from "../i18n/i18n";

export class TaskCreateModal extends Modal {
    private taskManager: TaskManager;
    private tagStore: TagStore;
    private getSettings: () => PluginSettings;
    private onCreated: () => void;

    private formData: Partial<TaskModel> = {};

    constructor(
        app: App,
        taskManager: TaskManager,
        tagStore: TagStore,
        getSettings: () => PluginSettings,
        onCreated: () => void
    ) {
        super(app);
        this.taskManager = taskManager;
        this.tagStore = tagStore;
        this.getSettings = getSettings;
        this.onCreated = onCreated;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("atm-create-modal");

        contentEl.createEl("h2", { text: t("modal.create.title") });

        const settings = this.getSettings();
        this.formData = {
            prioritaet: settings.defaultPriority,
            tags: []
        };

        // Aufgabe (Titel) – Pflicht
        new Setting(contentEl)
            .setName(t("task.field.aufgabe") + " *")
            .addText((text) =>
                text.setPlaceholder(t("task.field.aufgabe")).onChange((v) => {
                    this.formData.aufgabe = v;
                })
            );

        // Bezeichnung
        new Setting(contentEl)
            .setName(t("task.field.bezeichnung"))
            .addText((text) =>
                text
                    .setPlaceholder(t("task.field.bezeichnung"))
                    .onChange((v) => {
                        this.formData.bezeichnung = v;
                    })
            );

        // Priorität
        new Setting(contentEl)
            .setName(t("task.field.prioritaet"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption(
                        String(Priority.HIGHEST),
                        t("task.priority.highest")
                    )
                    .addOption(
                        String(Priority.HIGH),
                        t("task.priority.high")
                    )
                    .addOption(
                        String(Priority.NORMAL),
                        t("task.priority.normal")
                    )
                    .addOption(
                        String(Priority.LOW),
                        t("task.priority.low")
                    )
                    .setValue(String(settings.defaultPriority))
                    .onChange((v) => {
                        this.formData.prioritaet =
                            parseInt(v) as Priority;
                    })
            );

        // Fälligkeitsdatum
        new Setting(contentEl)
            .setName(t("task.field.faelligkeitsdatum"))
            .addText((text) => {
                text.inputEl.type = "date";
                text.onChange((v) => {
                    this.formData.faelligkeitsdatum = v
                        ? parseDate(v)
                        : null;
                });
            });

        // Tags
        new Setting(contentEl).setName(t("task.field.tags")).addText(
            (text) => {
                text.setPlaceholder("Tag1, Tag2, ...");
                text.onChange((v) => {
                    this.formData.tags = v
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0);
                });

                // Autocomplete
                const suggestionsDiv = contentEl.createDiv({
                    cls: "atm-modal-tag-suggestions"
                });
                text.inputEl.addEventListener("input", () => {
                    suggestionsDiv.empty();
                    const parts = text.inputEl.value.split(",");
                    const current = parts[parts.length - 1].trim();
                    if (!current) return;

                    const suggestions = this.tagStore
                        .getSuggestions(current)
                        .slice(0, 5);
                    for (const sug of suggestions) {
                        const item = suggestionsDiv.createEl("div", {
                            text: sug,
                            cls: "atm-tag-suggestion-item"
                        });
                        item.addEventListener("click", () => {
                            parts[parts.length - 1] = sug;
                            text.inputEl.value =
                                parts.join(", ") + ", ";
                            this.formData.tags = parts
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0);
                            suggestionsDiv.empty();
                            text.inputEl.focus();
                        });
                    }
                });
            }
        );

        // Link
        new Setting(contentEl)
            .setName(t("task.field.link"))
            .addText((text) =>
                text.setPlaceholder("https://...").onChange((v) => {
                    this.formData.link = v;
                })
            );

        // Wiederkehrend
        new Setting(contentEl)
            .setName(t("task.field.wiederkehrend"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("", t("task.recurrence.none"))
                    .addOption(
                        RecurrenceInterval.DAILY,
                        t("task.recurrence.daily")
                    )
                    .addOption(
                        RecurrenceInterval.WEEKLY,
                        t("task.recurrence.weekly")
                    )
                    .addOption(
                        RecurrenceInterval.MONTHLY,
                        t("task.recurrence.monthly")
                    )
                    .addOption(
                        RecurrenceInterval.YEARLY,
                        t("task.recurrence.yearly")
                    )
                    .onChange((v) => {
                        if (v) {
                            this.formData.wiederkehrend = {
                                aktiv: true,
                                intervall:
                                    v as RecurrenceInterval,
                                wert: 1
                            };
                        } else {
                            this.formData.wiederkehrend = {
                                aktiv: false,
                                intervall: null,
                                wert: null
                            };
                        }
                    })
            );

        // Erinnerung
        new Setting(contentEl)
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
                    .onChange((v) => {
                        if (v) {
                            this.formData.erinnerung = {
                                aktiv: true,
                                zeit: v as ReminderTime
                            };
                        } else {
                            this.formData.erinnerung = {
                                aktiv: false,
                                zeit: null
                            };
                        }
                    })
            );

        // Notizen
        new Setting(contentEl)
            .setName(t("task.field.notizen"))
            .addTextArea((area) => {
                area.inputEl.rows = 4;
                area.inputEl.addClass("atm-modal-textarea");
                area.onChange((v) => {
                    this.formData.notizen = v;
                });
            });

        // Buttons
        const buttonRow = contentEl.createDiv({ cls: "atm-modal-buttons" });

        const cancelBtn = buttonRow.createEl("button", {
            text: t("modal.create.cancel"),
            cls: "atm-btn-cancel"
        });
        cancelBtn.addEventListener("click", () => {
            this.close();
        });

        const submitBtn = buttonRow.createEl("button", {
            text: t("modal.create.submit"),
            cls: "atm-btn-submit"
        });
        submitBtn.addEventListener("click", async () => {
            if (!this.formData.aufgabe || !this.formData.aufgabe.trim()) {
                // Pflichtfeld fehlt
                const input = contentEl.querySelector(
                    "input"
                ) as HTMLInputElement;
                if (input) {
                    input.addClass("atm-input-error");
                    input.focus();
                }
                return;
            }
            await this.taskManager.create(this.formData);
            this.onCreated();
            this.close();
        });
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
