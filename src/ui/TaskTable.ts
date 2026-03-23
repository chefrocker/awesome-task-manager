// ============================================================
// TaskTable.ts – Tabellen-Rendering mit Inline-Editing
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import {
    TaskModel,
    Priority,
    Status,
    formatDate,
    isOverdue,
    getPercentCssClass,
    getPercentColor,
    priorityToString
} from "../core/TaskModel";
import { TaskManager } from "../core/TaskManager";
import { TagStore } from "../core/TagStore";
import { PluginSettings } from "../settings/SettingsModel";
import { t } from "../i18n/i18n";

export interface TaskTableCallbacks {
    onTaskClick: (task: TaskModel) => void;
    onTaskUpdated: () => void;
}

export class TaskTable {
    private container: HTMLElement;
    private taskManager: TaskManager;
    private tagStore: TagStore;
    private getSettings: () => PluginSettings;
    private callbacks: TaskTableCallbacks;

    constructor(
        container: HTMLElement,
        taskManager: TaskManager,
        tagStore: TagStore,
        getSettings: () => PluginSettings,
        callbacks: TaskTableCallbacks
    ) {
        this.container = container;
        this.taskManager = taskManager;
        this.tagStore = tagStore;
        this.getSettings = getSettings;
        this.callbacks = callbacks;
    }

    render(tasks: TaskModel[]): void {
        this.container.empty();
        this.container.addClass("atm-table-container");

        if (tasks.length === 0) {
            this.container.createEl("p", {
                text: t("dashboard.empty"),
                cls: "atm-empty-message"
            });
            return;
        }

        const table = this.container.createEl("table", {
            cls: "atm-task-table"
        });

        // Header
        const thead = table.createEl("thead");
        const headerRow = thead.createEl("tr");
        const headers = [
            t("task.field.aufgabe"),
            t("task.field.bezeichnung"),
            t("task.field.prioritaet"),
            t("task.field.status"),
            t("task.field.faelligkeitsdatum"),
            t("task.field.prozent"),
            t("task.field.tags")
        ];
        for (const h of headers) {
            headerRow.createEl("th", { text: h });
        }

        // Body
        const tbody = table.createEl("tbody");
        for (const task of tasks) {
            this.renderRow(tbody, task);
        }
    }

    private renderRow(tbody: HTMLElement, task: TaskModel): void {
        const settings = this.getSettings();
        const row = tbody.createEl("tr", { cls: "atm-task-row" });

        // Überfällig-Markierung
        if (
            task.faelligkeitsdatum &&
            isOverdue(task.faelligkeitsdatum) &&
            task.prozent < 100
        ) {
            row.addClass("atm-overdue");
        }

        // Erledigt-Markierung
        if (task.prozent >= 100) {
            row.addClass("atm-completed");
        }

        // Aufgabe (klickbar)
        const titleCell = row.createEl("td", { cls: "atm-cell-title" });
        const titleLink = titleCell.createEl("span", {
            text: task.wiederkehrend.aktiv
                ? `🔄 ${task.aufgabe}`
                : task.aufgabe,
            cls: "atm-task-link"
        });
        titleLink.addEventListener("click", () => {
            this.callbacks.onTaskClick(task);
        });

        // Bezeichnung
        row.createEl("td", {
            text: task.bezeichnung,
            cls: "atm-cell-bezeichnung"
        });

        // Priorität (inline editierbar)
        const prioCell = row.createEl("td", { cls: "atm-cell-priority" });
        this.renderPriorityDropdown(prioCell, task);

        // Status (inline editierbar)
        const statusCell = row.createEl("td", { cls: "atm-cell-status" });
        this.renderStatusDropdown(statusCell, task);

        // Fälligkeitsdatum
        const dateText = task.faelligkeitsdatum
            ? formatDate(task.faelligkeitsdatum, settings.dateFormat)
            : "";
        const dateCell = row.createEl("td", {
            text: dateText,
            cls: "atm-cell-date"
        });
        if (
            task.faelligkeitsdatum &&
            isOverdue(task.faelligkeitsdatum) &&
            task.prozent < 100
        ) {
            dateCell.createEl("span", { text: " ⚠️" });
        }

        // % Abgeschlossen (inline editierbar)
        const percentCell = row.createEl("td", {
            cls: "atm-cell-percent"
        });
        this.renderPercentSlider(percentCell, task);

        // Tags (inline editierbar)
        const tagsCell = row.createEl("td", { cls: "atm-cell-tags" });
        this.renderTagsInline(tagsCell, task);
    }

    private renderPriorityDropdown(
        cell: HTMLElement,
        task: TaskModel
    ): void {
        const select = cell.createEl("select", {
            cls: "atm-inline-select atm-priority-select"
        });

        const options = [
            { value: Priority.HIGHEST, label: t("task.priority.highest") },
            { value: Priority.HIGH, label: t("task.priority.high") },
            { value: Priority.NORMAL, label: t("task.priority.normal") },
            { value: Priority.LOW, label: t("task.priority.low") }
        ];

        for (const opt of options) {
            const option = select.createEl("option", {
                text: opt.label,
                value: String(opt.value)
            });
            if (opt.value === task.prioritaet) {
                option.selected = true;
            }
        }

        select.addEventListener("change", async () => {
            const newPriority = parseInt(select.value) as Priority;
            await this.taskManager.update(task, {
                prioritaet: newPriority
            });
            this.callbacks.onTaskUpdated();
        });
    }

    private renderStatusDropdown(
        cell: HTMLElement,
        task: TaskModel
    ): void {
        const select = cell.createEl("select", {
            cls: "atm-inline-select atm-status-select"
        });

        const options = [
            { value: Status.OPEN, label: t("task.status.open") },
            {
                value: Status.IN_PROGRESS,
                label: t("task.status.inprogress")
            },
            {
                value: Status.COMPLETED,
                label: t("task.status.completed")
            }
        ];

        for (const opt of options) {
            const option = select.createEl("option", {
                text: opt.label,
                value: opt.value
            });
            if (opt.value === task.status) {
                option.selected = true;
            }
        }

        select.addEventListener("change", async () => {
            await this.taskManager.update(task, {
                status: select.value as Status
            });
            this.callbacks.onTaskUpdated();
        });
    }

    private renderPercentSlider(
        cell: HTMLElement,
        task: TaskModel
    ): void {
        const wrapper = cell.createDiv({ cls: "atm-percent-wrapper" });

        const colorClass = getPercentCssClass(task.prozent);

        const label = wrapper.createEl("span", {
            text: `${task.prozent}%`,
            cls: `atm-percent-label ${colorClass}`
        });
        label.style.color = getPercentColor(task.prozent);

        const slider = wrapper.createEl("input", {
            type: "range",
            cls: "atm-percent-slider"
        }) as HTMLInputElement;
        slider.min = "0";
        slider.max = "100";
        slider.step = "5";
        slider.value = String(task.prozent);

        slider.addEventListener("input", () => {
            label.textContent = `${slider.value}%`;
            const val = parseInt(slider.value);
            label.style.color = getPercentColor(val);
        });

        slider.addEventListener("change", async () => {
            const newPercent = parseInt(slider.value);
            await this.taskManager.update(task, { prozent: newPercent });
            this.callbacks.onTaskUpdated();
        });
    }

    private renderTagsInline(cell: HTMLElement, task: TaskModel): void {
        const wrapper = cell.createDiv({ cls: "atm-tags-wrapper" });

        for (const tag of task.tags) {
            const badge = wrapper.createEl("span", {
                text: tag,
                cls: "atm-tag-badge"
            });

            badge.addEventListener("click", async (e) => {
                e.stopPropagation();
                const newTags = task.tags.filter((t) => t !== tag);
                await this.taskManager.update(task, { tags: newTags });
                this.callbacks.onTaskUpdated();
            });
        }

        // Kleiner Add-Button
        const addBtn = wrapper.createEl("span", {
            text: "+",
            cls: "atm-tag-add-btn"
        });
        addBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showTagAutocomplete(wrapper, task, addBtn);
        });
    }

    private showTagAutocomplete(
        wrapper: HTMLElement,
        task: TaskModel,
        addBtn: HTMLElement
    ): void {
        addBtn.style.display = "none";

        const input = wrapper.createEl("input", {
            type: "text",
            cls: "atm-tag-input",
            placeholder: "Tag..."
        }) as HTMLInputElement;

        const suggestionsDiv = wrapper.createDiv({
            cls: "atm-tag-suggestions"
        });

        input.addEventListener("input", () => {
            suggestionsDiv.empty();
            const suggestions = this.tagStore
                .getSuggestions(input.value)
                .filter((s) => !task.tags.includes(s));

            for (const suggestion of suggestions.slice(0, 5)) {
                const item = suggestionsDiv.createEl("div", {
                    text: suggestion,
                    cls: "atm-tag-suggestion-item"
                });
                item.addEventListener("click", async () => {
                    const newTags = [...task.tags, suggestion];
                    await this.taskManager.update(task, {
                        tags: newTags
                    });
                    cleanup();
                    this.callbacks.onTaskUpdated();
                });
            }
        });

        input.addEventListener("keydown", async (e) => {
            if (e.key === "Enter" && input.value.trim()) {
                const newTags = [...task.tags, input.value.trim()];
                await this.taskManager.update(task, { tags: newTags });
                cleanup();
                this.callbacks.onTaskUpdated();
            }
            if (e.key === "Escape") {
                cleanup();
            }
        });

        input.addEventListener("blur", () => {
            setTimeout(() => cleanup(), 200);
        });

        const cleanup = () => {
            input.remove();
            suggestionsDiv.remove();
            addBtn.style.display = "";
        };

        input.focus();
    }
}
