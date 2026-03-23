// ============================================================
// TaskModel.ts – Datenmodell, Enums und Interfaces
// Awesome Task Manager – Obsidian Plugin
// ============================================================

export enum Priority {
    HIGHEST = 1,
    HIGH = 2,
    NORMAL = 3,
    LOW = 4
}

export enum Status {
    OPEN = "Offen",
    IN_PROGRESS = "in Bearbeitung",
    COMPLETED = "Abgeschlossen"
}

export enum RecurrenceInterval {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly",
    CUSTOM = "custom"
}

export enum ReminderTime {
    ONE_DAY_BEFORE = "1-day-before",
    SAME_DAY = "same-day",
    ONE_HOUR_BEFORE = "1-hour-before",
    CUSTOM = "custom"
}

export interface RecurrenceRule {
    aktiv: boolean;
    intervall: RecurrenceInterval | null;
    wert: number | null;
    wochentag?: number | null;
    monatstag?: number | null;
}

export interface ReminderRule {
    aktiv: boolean;
    zeit: ReminderTime | null;
    customMinutes?: number | null;
}

export interface FilterOptions {
    tag?: string;
    priority?: Priority;
    bezeichnung?: string;
    searchText?: string;
    tab?: "today" | "week" | "open" | "all";
}

export interface ExcelRow {
    aufgabe: string;
    bezeichnung: string;
    prioritaet: string;
    status: string;
    anfangsdatum: string;
    faelligkeitsdatum: string;
    abschlussdatum: string;
    prozentAbgeschlossen: string;
    erledigt: string;
    notizen: string;
    link: string;
}

export interface TaskModel {
    aufgabe: string;
    bezeichnung: string;
    prioritaet: Priority;
    prioritaet_nr: number;
    status: Status;
    anfangsdatum: Date;
    faelligkeitsdatum: Date | null;
    abschlussdatum: Date | null;
    prozent: number;
    erledigt: boolean;
    tags: string[];
    link: string;
    bilder: string[];
    wiederkehrend: RecurrenceRule;
    erinnerung: ReminderRule;
    notizen: string;
    filePath: string;
}

export function priorityToNumber(p: Priority): number {
    return p as number;
}

export function priorityFromString(s: string): Priority {
    switch (s) {
        case "Höchste":
        case "Highest":
            return Priority.HIGHEST;
        case "Hoch":
        case "High":
            return Priority.HIGH;
        case "Niedrig":
        case "Low":
            return Priority.LOW;
        case "Normal":
        default:
            return Priority.NORMAL;
    }
}

export function priorityToString(p: Priority): string {
    switch (p) {
        case Priority.HIGHEST: return "Höchste";
        case Priority.HIGH: return "Hoch";
        case Priority.LOW: return "Niedrig";
        case Priority.NORMAL:
        default: return "Normal";
    }
}

export function statusFromString(s: string): Status {
    switch (s) {
        case "in Bearbeitung":
        case "In Progress":
            return Status.IN_PROGRESS;
        case "Abgeschlossen":
        case "Completed":
            return Status.COMPLETED;
        case "Offen":
        case "Open":
        default:
            return Status.OPEN;
    }
}

export function createDefaultTask(): TaskModel {
    return {
        aufgabe: "",
        bezeichnung: "",
        prioritaet: Priority.NORMAL,
        prioritaet_nr: 3,
        status: Status.OPEN,
        anfangsdatum: new Date(),
        faelligkeitsdatum: null,
        abschlussdatum: null,
        prozent: 0,
        erledigt: false,
        tags: [],
        link: "",
        bilder: [],
        wiederkehrend: { aktiv: false, intervall: null, wert: null },
        erinnerung: { aktiv: false, zeit: null },
        notizen: "",
        filePath: ""
    };
}

// ---- Datum-Hilfsfunktionen ----

export function formatDate(date: Date | null, format: string): string {
    if (!date || isNaN(date.getTime())) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString();
    if (format === "yyyy-MM-dd") return `${y}-${m}-${d}`;
    return `${d}.${m}.${y}`;
}

export function parseDate(str: string | null | undefined): Date | null {
    if (!str || str === "" || str === "null") return null;
    if (typeof str === "object") return str as unknown as Date;
    // yyyy-MM-dd
    let match = String(str).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
        return new Date(
            parseInt(match[1]),
            parseInt(match[2]) - 1,
            parseInt(match[3])
        );
    }
    // dd.MM.yyyy
    match = String(str).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (match) {
        return new Date(
            parseInt(match[3]),
            parseInt(match[2]) - 1,
            parseInt(match[1])
        );
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

export function isToday(date: Date): boolean {
    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
}

export function isOverdue(date: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < now;
}

export function isThisWeek(date: Date): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d >= monday && d <= sunday;
}

export function sanitizeFilename(name: string): string {
    return name
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 100);
}

export function getPercentColor(percent: number): string {
    if (percent === 0) return "#e74c3c";
    if (percent >= 1 && percent <= 24) return "#e67e22";
    if (percent >= 25 && percent <= 75) return "#f1c40f";
    if (percent >= 76 && percent <= 99) return "#2ecc71";
    if (percent >= 100) return "#27ae60";
    return "#e74c3c";
}

export function getPercentCssClass(percent: number): string {
    if (percent === 0) return "atm-percent-0";
    if (percent >= 1 && percent <= 24) return "atm-percent-1-24";
    if (percent >= 25 && percent <= 75) return "atm-percent-25-75";
    if (percent >= 76 && percent <= 99) return "atm-percent-76-99";
    if (percent >= 100) return "atm-percent-100";
    return "atm-percent-0";
}
