// ============================================================
// FilterBar.ts – Filter-Dropdowns und Freitextsuche
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { Priority, FilterOptions } from "../core/TaskModel";
import { TagStore } from "../core/TagStore";
import { TaskManager } from "../core/TaskManager";
import { t } from "../i18n/i18n";

export interface FilterBarCallbacks {
    onFilterChange: (filters: FilterOptions) => void;
}

export class FilterBar {
    private container: HTMLElement;
    private taskManager: TaskManager;
    private tagStore: TagStore;
    private callbacks: FilterBarCallbacks;

    private currentFilters: FilterOptions = {};

    constructor(
        container: HTMLElement,
        taskManager: TaskManager,
        tagStore: TagStore,
        callbacks: FilterBarCallbacks
    ) {
        this.container = container;
        this.taskManager = taskManager;
        this.tagStore = tagStore;
        this.callbacks = callbacks;
    }

    render(): void {
        this.container.empty();
        this.container.addClass("atm-filterbar");

        // Tag-Filter
        const tagGroup = this.container.createDiv({ cls: "atm-filter-group" });
        tagGroup.createEl("label", { text: t("dashboard.filter.tag") });
        const tagSelect = tagGroup.createEl("select", {
            cls: "atm-filter-select"
        });
        tagSelect.createEl("option", {
            text: t("dashboard.filter.all"),
            value: ""
        });
        for (const tag of this.tagStore.getAllTags()) {
            tagSelect.createEl("option", { text: tag, value: tag });
        }
        if (this.currentFilters.tag) {
            tagSelect.value = this.currentFilters.tag;
        }
        tagSelect.addEventListener("change", () => {
            this.currentFilters.tag = tagSelect.value || undefined;
            this.callbacks.onFilterChange(this.currentFilters);
        });

        // Priorität-Filter
        const prioGroup = this.container.createDiv({
            cls: "atm-filter-group"
        });
        prioGroup.createEl("label", {
            text: t("dashboard.filter.priority")
        });
        const prioSelect = prioGroup.createEl("select", {
            cls: "atm-filter-select"
        });
        prioSelect.createEl("option", {
            text: t("dashboard.filter.all"),
            value: ""
        });
        prioSelect.createEl("option", {
            text: t("task.priority.highest"),
            value: String(Priority.HIGHEST)
        });
        prioSelect.createEl("option", {
            text: t("task.priority.high"),
            value: String(Priority.HIGH)
        });
        prioSelect.createEl("option", {
            text: t("task.priority.normal"),
            value: String(Priority.NORMAL)
        });
        prioSelect.createEl("option", {
            text: t("task.priority.low"),
            value: String(Priority.LOW)
        });
        if (this.currentFilters.priority !== undefined) {
            prioSelect.value = String(this.currentFilters.priority);
        }
        prioSelect.addEventListener("change", () => {
            this.currentFilters.priority = prioSelect.value
                ? (parseInt(prioSelect.value) as Priority)
                : undefined;
            this.callbacks.onFilterChange(this.currentFilters);
        });

        // Bezeichnung-Filter
        const bezGroup = this.container.createDiv({
            cls: "atm-filter-group"
        });
        bezGroup.createEl("label", {
            text: t("dashboard.filter.bezeichnung")
        });
        const bezSelect = bezGroup.createEl("select", {
            cls: "atm-filter-select"
        });
        bezSelect.createEl("option", {
            text: t("dashboard.filter.all"),
            value: ""
        });
        for (const bez of this.taskManager.getAllBezeichnungen()) {
            bezSelect.createEl("option", { text: bez, value: bez });
        }
        if (this.currentFilters.bezeichnung) {
            bezSelect.value = this.currentFilters.bezeichnung;
        }
        bezSelect.addEventListener("change", () => {
            this.currentFilters.bezeichnung =
                bezSelect.value || undefined;
            this.callbacks.onFilterChange(this.currentFilters);
        });

        // Freitextsuche
        const searchGroup = this.container.createDiv({
            cls: "atm-filter-group atm-search-group"
        });
        const searchInput = searchGroup.createEl("input", {
            type: "text",
            placeholder: t("dashboard.search.placeholder"),
            cls: "atm-search-input"
        });
        if (this.currentFilters.searchText) {
            searchInput.value = this.currentFilters.searchText;
        }
        searchInput.addEventListener("input", () => {
            this.currentFilters.searchText =
                searchInput.value || undefined;
            this.callbacks.onFilterChange(this.currentFilters);
        });
    }

    getFilters(): FilterOptions {
        return { ...this.currentFilters };
    }

    setTab(tab: FilterOptions["tab"]): void {
        this.currentFilters.tab = tab;
    }

    resetFilters(): void {
        this.currentFilters = {};
    }
}
