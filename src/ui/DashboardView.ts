// ============================================================
// DashboardView.ts – Haupt-View (ItemView) für Obsidian
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { ItemView, WorkspaceLeaf } from "obsidian";
import { TaskManager } from "../core/TaskManager";
import { TagStore } from "../core/TagStore";
import { ImageStorage } from "../storage/ImageStorage";
import { RecurrenceEngine } from "../core/RecurrenceEngine";
import { PluginSettings } from "../settings/SettingsModel";
import { TabBar, TabId } from "./TabBar";
import { FilterBar } from "./FilterBar";
import { TaskTable } from "./TaskTable";
import { TaskCreateModal } from "./TaskCreateModal";
import { TaskDetailView } from "./TaskDetailView";
import { ExportButton } from "./ExportButton";
import { FilterOptions, TaskModel } from "../core/TaskModel";
import { t } from "../i18n/i18n";

export const VIEW_TYPE_DASHBOARD = "awesome-task-dashboard";

export class DashboardView extends ItemView {
    private taskManager: TaskManager;
    private tagStore: TagStore;
    private imageStorage: ImageStorage;
    private recurrenceEngine: RecurrenceEngine;
    private getSettings: () => PluginSettings;

    private currentTab: TabId = "today";
    private currentFilters: FilterOptions = {};
    private isDetailView = false;

    // Sub-Komponenten
    private tabBar!: TabBar;
    private filterBar!: FilterBar;
    private taskTable!: TaskTable;
    private exportButton!: ExportButton;

    // Container-Referenzen
    private headerEl!: HTMLElement;
    private tabBarEl!: HTMLElement;
    private filterBarEl!: HTMLElement;
    private contentEl_main!: HTMLElement;

    constructor(
        leaf: WorkspaceLeaf,
        taskManager: TaskManager,
        tagStore: TagStore,
        imageStorage: ImageStorage,
        recurrenceEngine: RecurrenceEngine,
        getSettings: () => PluginSettings
    ) {
        super(leaf);
        this.taskManager = taskManager;
        this.tagStore = tagStore;
        this.imageStorage = imageStorage;
        this.recurrenceEngine = recurrenceEngine;
        this.getSettings = getSettings;
    }

    getViewType(): string {
        return VIEW_TYPE_DASHBOARD;
    }

    getDisplayText(): string {
        return t("dashboard.title");
    }

    getIcon(): string {
        return "check-square";
    }

    async onOpen(): Promise<void> {
        const settings = this.getSettings();
        this.currentTab = settings.defaultTab as TabId;
        this.currentFilters = { tab: this.currentTab };

        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();
        container.addClass("atm-dashboard");

        // Header-Bereich
        this.headerEl = container.createDiv({ cls: "atm-dashboard-header" });
        this.headerEl.createEl("h2", {
            text: t("dashboard.title"),
            cls: "atm-dashboard-title"
        });

        const buttonRow = this.headerEl.createDiv({
            cls: "atm-dashboard-buttons"
        });

        // Neue Aufgabe Button
        const newBtn = buttonRow.createEl("button", {
            text: t("dashboard.button.new"),
            cls: "atm-btn-new"
        });
        newBtn.addEventListener("click", () => {
            this.openCreateModal();
        });

        // Export Button
        this.exportButton = new ExportButton(this.getSettings);
        this.exportButton.createButton(buttonRow, () =>
            this.getCurrentTasks()
        );

        // Tab-Bar
        this.tabBarEl = container.createDiv({ cls: "atm-tabbar-container" });
        this.tabBar = new TabBar(this.tabBarEl, {
            onTabChange: (tab) => this.onTabChange(tab)
        });
        this.tabBar.render(this.currentTab);

        // Filter-Bar
        this.filterBarEl = container.createDiv({
            cls: "atm-filterbar-container"
        });
        this.filterBar = new FilterBar(
            this.filterBarEl,
            this.taskManager,
            this.tagStore,
            {
                onFilterChange: (filters) => this.onFilterChange(filters)
            }
        );
        this.filterBar.setTab(this.currentTab);
        this.filterBar.render();

        // Hauptinhalt
        this.contentEl_main = container.createDiv({
            cls: "atm-content-container"
        });

        // Tabelle initialisieren
        this.taskTable = new TaskTable(
            this.contentEl_main,
            this.taskManager,
            this.tagStore,
            this.getSettings,
            {
                onTaskClick: (task) => this.openDetailView(task),
                onTaskUpdated: () => {
                    void this.refreshDashboard();
                }
            }

        );

        // Daten laden und anzeigen
        await this.taskManager.refresh();
        this.renderTable();

        // Auf Refresh reagieren
        this.taskManager.onRefresh(() => {
            if (!this.isDetailView) {
                this.renderTable();
            }
        });
    }

    async onClose(): Promise<void> {
        // Cleanup
    }

    // ---- Event-Handler ----

    private onTabChange(tab: TabId): void {
        this.currentTab = tab;
        this.currentFilters.tab = tab;
        this.tabBar.render(tab);
        this.filterBar.setTab(tab);
        this.renderTable();
    }

    private onFilterChange(filters: FilterOptions): void {
        this.currentFilters = { ...filters, tab: this.currentTab };
        this.renderTable();
    }

    private renderTable(): void {
        const tasks = this.getCurrentTasks();
        this.taskTable.render(tasks);
    }

    private getCurrentTasks(): TaskModel[] {
        return this.taskManager.getFiltered(this.currentFilters);
    }

    private async refreshDashboard(): Promise<void> {
        await this.taskManager.refresh();
        this.filterBar.render();
        this.renderTable();
    }

    // ---- Navigation ----

    private openCreateModal(): void {
        const modal = new TaskCreateModal(
            this.app,
            this.taskManager,
            this.tagStore,
            this.getSettings,
            () => {
                void this.refreshDashboard();
            }
        );
        modal.open();
    }

    private openDetailView(task: TaskModel): void {
        this.isDetailView = true;

        // Dashboard-Elemente ausblenden
        this.headerEl.addClass("atm-hidden");
        this.tabBarEl.addClass("atm-hidden");
        this.filterBarEl.addClass("atm-hidden");
        this.contentEl_main.empty();

        const detailView = new TaskDetailView(
            this.contentEl_main,
            this.app,
            task,
            this.taskManager,
            this.tagStore,
            this.imageStorage,
            this.recurrenceEngine,
            this.getSettings,
            {
                onBack: () => this.closeDetailView(),
                onDeleted: () => this.closeDetailView(),
                onUpdated: () => {
                    // Bei Updates aktualisiert sich die Detail-Ansicht selbst
                }
            }
        );
        detailView.render();
    }

    private closeDetailView(): void {
        this.isDetailView = false;

        // Dashboard-Elemente wieder einblenden
        this.headerEl.removeClass("atm-hidden");
        this.tabBarEl.removeClass("atm-hidden");
        this.filterBarEl.removeClass("atm-hidden");

        void this.refreshDashboard();

    }
}
