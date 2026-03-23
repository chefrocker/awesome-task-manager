// ============================================================
// SettingsModel.ts – Einstellungen Datenmodell + Defaults
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { Priority, ReminderTime } from "../core/TaskModel";

export interface PluginSettings {
    taskFolder: string;
    imageFolder: string;
    language: "de" | "en";
    defaultPriority: Priority;
    defaultTab: "today" | "week" | "open" | "all";
    dateFormat: "dd.MM.yyyy" | "yyyy-MM-dd";
    dailySummary: boolean;
    defaultReminderTime: ReminderTime;
    lastSummaryDate: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    taskFolder: "Aufgaben",
    imageFolder: "Anhaenge",
    language: "de",
    defaultPriority: Priority.NORMAL,
    defaultTab: "today",
    dateFormat: "dd.MM.yyyy",
    dailySummary: true,
    defaultReminderTime: ReminderTime.SAME_DAY,
    lastSummaryDate: ""
};
