// ============================================================
// main.ts – Plugin-Einstiegspunkt
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { Plugin, WorkspaceLeaf } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS } from "./settings/SettingsModel";
import { AwesomeTaskSettingsTab } from "./settings/SettingsTab";
import { FileStorage } from "./storage/FileStorage";
import { ImageStorage } from "./storage/ImageStorage";
import { TagStore } from "./core/TagStore";
import { TaskManager } from "./core/TaskManager";
import { RecurrenceEngine } from "./core/RecurrenceEngine";
import { ReminderEngine } from "./core/ReminderEngine";
import { DashboardView, VIEW_TYPE_DASHBOARD } from "./ui/DashboardView";
import { DailySummaryModal } from "./ui/DailySummaryModal";
import { setLanguage } from "./i18n/i18n";
import { formatDate } from "./core/TaskModel";

export default class AwesomeTaskManagerPlugin extends Plugin {
    settings!: PluginSettings;

    // Kernkomponenten
    private fileStorage!: FileStorage;
    private imageStorage!: ImageStorage;
    private tagStore!: TagStore;
    private taskManager!: TaskManager;
    private recurrenceEngine!: RecurrenceEngine;
    private reminderEngine!: ReminderEngine;

    async onload(): Promise<void> {
        console.debug("Awesome Task Manager: Loading plugin...");


        // Einstellungen laden
        await this.loadSettings();
        setLanguage(this.settings.language);

        // Kernkomponenten initialisieren
        this.fileStorage = new FileStorage(
            this.app,
            () => this.settings
        );
        this.imageStorage = new ImageStorage(
            this.app,
            () => this.settings
        );
        this.tagStore = new TagStore(this.app);
        await this.tagStore.load();

        this.taskManager = new TaskManager(
            this.fileStorage,
            this.imageStorage,
            this.tagStore,
            () => this.settings
        );

        this.recurrenceEngine = new RecurrenceEngine(this.taskManager);
        this.reminderEngine = new ReminderEngine(
            this.taskManager,
            () => this.settings
        );

        // Dashboard-View registrieren
        this.registerView(VIEW_TYPE_DASHBOARD, (leaf: WorkspaceLeaf) => {
            return new DashboardView(
                leaf,
                this.taskManager,
                this.tagStore,
                this.imageStorage,
                this.recurrenceEngine,
                () => this.settings
            );
        });

        // Settings-Tab registrieren
        this.addSettingTab(
            new AwesomeTaskSettingsTab(
                this.app,
                this,
                this.settings,
                this.tagStore,
                async () => await this.saveSettings()
            )
        );

        // Ribbon-Icon
        this.addRibbonIcon("check-square", "Awesome task manager", () => {
            void this.activateDashboard();
        });


        // Command: Dashboard öffnen
        this.addCommand({
            id: "open-awesome-task-dashboard",
            name: "Open task dashboard",
            callback: () => {
                void this.activateDashboard();
            }
        });


        // Command: Neue Aufgabe
        this.addCommand({
            id: "create-new-task",
            name: "Create new task",
            callback: () => {
                void this.activateDashboard();
                // Modal wird über Dashboard geöffnet
            }
        });


        // Initiales Laden der Tasks
        await this.taskManager.refresh();

        // Erinnerungen starten
        this.reminderEngine.start();

        // Tägliche Zusammenfassung
        this.app.workspace.onLayoutReady(() => {
            void this.showDailySummaryIfNeeded();
        });


        console.debug("Awesome Task Manager: Plugin loaded successfully.");

    }

    onunload(): void {
        console.debug("Awesome Task Manager: Unloading plugin...");
        this.reminderEngine.stop();
    }


    // ---- Settings ----

    async loadSettings(): Promise<void> {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
        setLanguage(this.settings.language);
    }

    // ---- Dashboard aktivieren ----

    async activateDashboard(): Promise<void> {
        const { workspace } = this.app;

        let leaf = workspace.getLeavesOfType(VIEW_TYPE_DASHBOARD)[0];

        if (!leaf) {
            const newLeaf = workspace.getRightLeaf(false);
            if (newLeaf) {
                await newLeaf.setViewState({
                    type: VIEW_TYPE_DASHBOARD,
                    active: true
                });
                leaf = newLeaf;
            }
        }

        if (leaf) {
            void this.app.workspace.revealLeaf(leaf);
        }

    }

    // ---- Tägliche Zusammenfassung ----

    private async showDailySummaryIfNeeded(): Promise<void> {
        if (!this.settings.dailySummary) return;

        const today = formatDate(new Date(), "yyyy-MM-dd");
        if (this.settings.lastSummaryDate === today) return;

        // Warten bis Tasks geladen
        await this.taskManager.refresh();

        const overdue = this.taskManager.getTodayAndOverdue();
        if (overdue.length > 0) {
            const modal = new DailySummaryModal(
                this.app,
                this.taskManager,
                () => this.settings
            );
            modal.open();
        }

        // Datum speichern
        this.settings.lastSummaryDate = today;
        await this.saveSettings();
    }
}
