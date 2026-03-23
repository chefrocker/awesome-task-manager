// ============================================================
// ReminderEngine.ts – Erinnerungen prüfen und auslösen
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { Notice } from "obsidian";
import { TaskModel, ReminderTime, Status, formatDate } from "./TaskModel";
import { TaskManager } from "./TaskManager";
import { PluginSettings } from "../settings/SettingsModel";
import { t } from "../i18n/i18n";

export class ReminderEngine {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private notifiedTasks: Set<string> = new Set();

    constructor(
        private taskManager: TaskManager,
        private getSettings: () => PluginSettings
    ) {}

    start(): void {
        // Prüfe alle 60 Sekunden
        this.intervalId = setInterval(() => {
            this.checkReminders();
        }, 60 * 1000);

        // Sofort prüfen beim Start
        setTimeout(() => this.checkReminders(), 5000);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    checkReminders(): void {
        const tasks = this.taskManager.getAll();
        const now = new Date();

        for (const task of tasks) {
            if (task.status === Status.COMPLETED) continue;
            if (!task.erinnerung.aktiv || !task.erinnerung.zeit) continue;
            if (!task.faelligkeitsdatum) continue;

            const key = `${task.filePath}_${task.faelligkeitsdatum.getTime()}`;
            if (this.notifiedTasks.has(key)) continue;

            if (this.shouldNotify(task, now)) {
                this.showNotification(task);
                this.notifiedTasks.add(key);
            }
        }
    }

    private shouldNotify(task: TaskModel, now: Date): boolean {
        const due = task.faelligkeitsdatum;
        if (!due) return false;

        const dueTime = new Date(due);
        dueTime.setHours(9, 0, 0, 0); // Standard-Erinnerungszeit 9:00

        switch (task.erinnerung.zeit) {
            case ReminderTime.ONE_DAY_BEFORE: {
                const reminderTime = new Date(dueTime);
                reminderTime.setDate(reminderTime.getDate() - 1);
                return now >= reminderTime && now <= dueTime;
            }
            case ReminderTime.SAME_DAY: {
                const todayStart = new Date(now);
                todayStart.setHours(0, 0, 0, 0);
                const dueStart = new Date(dueTime);
                dueStart.setHours(0, 0, 0, 0);
                return todayStart.getTime() === dueStart.getTime();
            }
            case ReminderTime.ONE_HOUR_BEFORE: {
                const reminderTime = new Date(dueTime);
                reminderTime.setHours(reminderTime.getHours() - 1);
                return now >= reminderTime && now <= dueTime;
            }
            case ReminderTime.CUSTOM: {
                const minutes = task.erinnerung.customMinutes || 60;
                const reminderTime = new Date(dueTime);
                reminderTime.setMinutes(
                    reminderTime.getMinutes() - minutes
                );
                return now >= reminderTime && now <= dueTime;
            }
            default:
                return false;
        }
    }

    showNotification(task: TaskModel): void {
        const settings = this.getSettings();
        const dateStr = task.faelligkeitsdatum
            ? formatDate(task.faelligkeitsdatum, settings.dateFormat)
            : "";
        const message = `${t("notification.reminder")}: ${task.aufgabe}\n📅 ${dateStr}`;
        new Notice(message, 10000);
    }

    showOverdueNotification(task: TaskModel): void {
        const settings = this.getSettings();
        const dateStr = task.faelligkeitsdatum
            ? formatDate(task.faelligkeitsdatum, settings.dateFormat)
            : "";
        const message = `${t("notification.overdue")}: ${task.aufgabe}\n📅 ${dateStr}`;
        new Notice(message, 10000);
    }

    resetNotified(): void {
        this.notifiedTasks.clear();
    }
}
