// ============================================================
// DailySummaryModal.ts – Tägliche Zusammenfassung beim Start
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { App, Modal } from "obsidian";
import { TaskModel, formatDate, isOverdue, isToday } from "../core/TaskModel";
import { TaskManager } from "../core/TaskManager";
import { PluginSettings } from "../settings/SettingsModel";
import { t } from "../i18n/i18n";

export class DailySummaryModal extends Modal {
    private taskManager: TaskManager;
    private getSettings: () => PluginSettings;

    constructor(
        app: App,
        taskManager: TaskManager,
        getSettings: () => PluginSettings
    ) {
        super(app);
        this.taskManager = taskManager;
        this.getSettings = getSettings;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("atm-summary-modal");

        contentEl.createEl("h2", { text: t("summary.title") });

        const settings = this.getSettings();
        const allTasks = this.taskManager.getAll();

        // Überfällige Aufgaben
        const overdueTasks = allTasks.filter((task) => {
            if (task.prozent >= 100) return false;
            if (!task.faelligkeitsdatum) return false;
            return isOverdue(task.faelligkeitsdatum);
        });

        // Heute fällig
        const todayTasks = allTasks.filter((task) => {
            if (task.prozent >= 100) return false;
            if (!task.faelligkeitsdatum) return false;
            return isToday(task.faelligkeitsdatum);
        });

        if (overdueTasks.length === 0 && todayTasks.length === 0) {
            contentEl.createEl("p", {
                text: t("summary.none"),
                cls: "atm-summary-none"
            });
            return;
        }

        // Überfällige
        if (overdueTasks.length > 0) {
            contentEl.createEl("h3", {
                text: `⚠️ ${t("summary.overdue")} (${overdueTasks.length})`,
                cls: "atm-summary-section-header atm-summary-overdue"
            });
            this.renderTaskList(contentEl, overdueTasks, settings);
        }

        // Heute fällig
        if (todayTasks.length > 0) {
            contentEl.createEl("h3", {
                text: `📅 ${t("summary.today")} (${todayTasks.length})`,
                cls: "atm-summary-section-header atm-summary-today"
            });
            this.renderTaskList(contentEl, todayTasks, settings);
        }
    }

    private renderTaskList(
        container: HTMLElement,
        tasks: TaskModel[],
        settings: PluginSettings
    ): void {
        const list = container.createEl("ul", { cls: "atm-summary-list" });

        for (const task of tasks) {
            const item = list.createEl("li", { cls: "atm-summary-item" });

            const titleSpan = item.createEl("span", {
                text: task.aufgabe,
                cls: "atm-summary-task-title"
            });

            if (task.faelligkeitsdatum) {
                item.createEl("span", {
                    text: ` – ${formatDate(
                        task.faelligkeitsdatum,
                        settings.dateFormat
                    )}`,
                    cls: "atm-summary-task-date"
                });
            }

            item.createEl("span", {
                text: ` (${task.prozent}%)`,
                cls: "atm-summary-task-percent"
            });
        }
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
