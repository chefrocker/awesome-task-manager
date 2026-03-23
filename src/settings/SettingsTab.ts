// ============================================================
// SettingsTab.ts – Obsidian Settings Page
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { App, PluginSettingTab, Setting, TextComponent } from "obsidian";
import { PluginSettings } from "./SettingsModel";
import { Priority } from "../core/TaskModel";
import { TagStore } from "../core/TagStore";
import { t, setLanguage } from "../i18n/i18n";

export class AwesomeTaskSettingsTab extends PluginSettingTab {
    private settings: PluginSettings;
    private tagStore: TagStore;
    private saveSettings: () => Promise<void>;

    constructor(
        app: App,
        plugin: any,
        settings: PluginSettings,
        tagStore: TagStore,
        saveSettings: () => Promise<void>
    ) {
        super(app, plugin);
        this.settings = settings;
        this.tagStore = tagStore;
        this.saveSettings = saveSettings;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: t("settings.title") });

        // Aufgaben-Ordner
        new Setting(containerEl)
            .setName(t("settings.taskFolder"))
            .setDesc(t("settings.taskFolder.desc"))
            .addText((text) =>
                text
                    .setPlaceholder("Aufgaben")
                    .setValue(this.settings.taskFolder)
                    .onChange(async (value) => {
                        this.settings.taskFolder = value || "Aufgaben";
                        await this.saveSettings();
                    })
            );

        // Bilder-Ordner
        new Setting(containerEl)
            .setName(t("settings.imageFolder"))
            .setDesc(t("settings.imageFolder.desc"))
            .addText((text) =>
                text
                    .setPlaceholder("Anhaenge")
                    .setValue(this.settings.imageFolder)
                    .onChange(async (value) => {
                        this.settings.imageFolder = value || "Anhaenge";
                        await this.saveSettings();
                    })
            );

        // Sprache
        new Setting(containerEl)
            .setName(t("settings.language"))
            .setDesc(t("settings.language.desc"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("de", "Deutsch")
                    .addOption("en", "English")
                    .setValue(this.settings.language)
                    .onChange(async (value) => {
                        this.settings.language = value as "de" | "en";
                        setLanguage(value);
                        await this.saveSettings();
                        this.display(); // UI neu rendern
                    })
            );

        // Standard-Priorität
        new Setting(containerEl)
            .setName(t("settings.defaultPriority"))
            .setDesc(t("settings.defaultPriority.desc"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption(String(Priority.HIGHEST), t("task.priority.highest"))
                    .addOption(String(Priority.HIGH), t("task.priority.high"))
                    .addOption(String(Priority.NORMAL), t("task.priority.normal"))
                    .addOption(String(Priority.LOW), t("task.priority.low"))
                    .setValue(String(this.settings.defaultPriority))
                    .onChange(async (value) => {
                        this.settings.defaultPriority = parseInt(value) as Priority;
                        await this.saveSettings();
                    })
            );

        // Standard-Tab
        new Setting(containerEl)
            .setName(t("settings.defaultTab"))
            .setDesc(t("settings.defaultTab.desc"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("today", t("dashboard.tab.today"))
                    .addOption("week", t("dashboard.tab.week"))
                    .addOption("open", t("dashboard.tab.open"))
                    .addOption("all", t("dashboard.tab.all"))
                    .setValue(this.settings.defaultTab)
                    .onChange(async (value) => {
                        this.settings.defaultTab = value as any;
                        await this.saveSettings();
                    })
            );

        // Datumsformat
        new Setting(containerEl)
            .setName(t("settings.dateFormat"))
            .setDesc(t("settings.dateFormat.desc"))
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("dd.MM.yyyy", "dd.MM.yyyy (23.03.2026)")
                    .addOption("yyyy-MM-dd", "yyyy-MM-dd (2026-03-23)")
                    .setValue(this.settings.dateFormat)
                    .onChange(async (value) => {
                        this.settings.dateFormat = value as any;
                        await this.saveSettings();
                    })
            );

        // Tägliche Zusammenfassung
        new Setting(containerEl)
            .setName(t("settings.dailySummary"))
            .setDesc(t("settings.dailySummary.desc"))
            .addToggle((toggle) =>
                toggle
                    .setValue(this.settings.dailySummary)
                    .onChange(async (value) => {
                        this.settings.dailySummary = value;
                        await this.saveSettings();
                    })
            );

        // Tag-Verwaltung
        containerEl.createEl("h3", { text: t("settings.tags") });
        containerEl.createEl("p", {
            text: t("settings.tags.desc"),
            cls: "setting-item-description"
        });

        const tags = this.tagStore.getAllTags();
        if (tags.length === 0) {
            containerEl.createEl("p", {
                text: t("settings.tags.empty"),
                cls: "atm-settings-empty"
            });
        } else {
            for (const tag of tags) {
                const tagSetting = new Setting(containerEl).setName(tag);

                tagSetting.addText((text) =>
                    text.setPlaceholder(tag).setValue(tag).onChange(() => {
                        // Wert wird beim Klick auf Umbenennen gespeichert
                    })
                );

                tagSetting.addButton((btn) =>
                    btn.setButtonText(t("settings.tags.rename")).onClick(async () => {
                        const inputEl = tagSetting.controlEl.querySelector(
                            "input"
                        ) as HTMLInputElement;
                        if (inputEl && inputEl.value && inputEl.value !== tag) {
                            this.tagStore.renameTag(tag, inputEl.value);
                            this.display();
                        }
                    })
                );

                tagSetting.addButton((btn) =>
                    btn
                        .setButtonText(t("settings.tags.delete"))
                        .setWarning()
                        .onClick(async () => {
                            this.tagStore.removeTag(tag);
                            this.display();
                        })
                );
            }
        }
    }
}
