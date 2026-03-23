// ============================================================
// FileStorage.ts – Markdown-Dateien lesen/schreiben
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import {
    App,
    TFile,
    TFolder,
    normalizePath,
    parseYaml,
    stringifyYaml
} from "obsidian";
import {
    TaskModel,
    priorityFromString,
    priorityToString,
    priorityToNumber,
    statusFromString,
    parseDate,
    formatDate,
    sanitizeFilename,
    RecurrenceInterval,
    ReminderTime
} from "../core/TaskModel";


import { PluginSettings } from "../settings/SettingsModel";

export class FileStorage {
    constructor(
        private app: App,
        private getSettings: () => PluginSettings
    ) {}

    async ensureFolder(folderPath: string): Promise<void> {
        const normalized = normalizePath(folderPath);
        const folder = this.app.vault.getAbstractFileByPath(normalized);
        if (!folder) {
            await this.app.vault.createFolder(normalized);
        }
    }

    async readAllTasks(): Promise<TaskModel[]> {
        const settings = this.getSettings();
        const folderPath = normalizePath(settings.taskFolder);
        await this.ensureFolder(folderPath);

        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder || !(folder instanceof TFolder)) {
            return [];
        }

        const tasks: TaskModel[] = [];
        for (const child of folder.children) {
            if (child instanceof TFile && child.extension === "md") {
                try {
                    const task = await this.readTask(child.path);
                    if (task) {
                        tasks.push(task);
                    }
                } catch (e) {
                    console.error(`Error reading task file: ${child.path}`, e);
                }
            }
        }
        return tasks;
    }

    async readTask(path: string): Promise<TaskModel | null> {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!file || !(file instanceof TFile)) return null;

        const content = await this.app.vault.read(file);
        return this.parseTaskContent(content, path);
    }

    parseTaskContent(content: string, filePath: string): TaskModel | null {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);
        if (!match) return null;

        let data: Record<string, unknown>;

        try {
            data = parseYaml(match[1]);
        } catch (e) {
            console.error(`Error parsing YAML in ${filePath}`, e);
            return null;
        }

        if (!data || typeof data !== "object" || !("aufgabe" in data)) return null;
        const taskData = data as Record<string, any>;


        // Notizen aus dem Body extrahieren (nach dem Frontmatter)
        let notizen = taskData.notizen || "";
        const bodyContent = content.substring(match[0].length).trim();
        if (bodyContent) {
            // Entferne "## Notizen" Header falls vorhanden
            const cleaned = bodyContent.replace(/^##\s*Notizen\s*/i, "").trim();
            if (cleaned && !notizen) {
                notizen = cleaned;
            }
        }

        const prioritaet = priorityFromString(taskData.prioritaet || "Normal");

        const task: TaskModel = {
            aufgabe: taskData.aufgabe || "",
            bezeichnung: taskData.bezeichnung || "",
            prioritaet: prioritaet,
            prioritaet_nr: priorityToNumber(prioritaet),
            status: statusFromString(taskData.status || "Offen"),
            anfangsdatum: parseDate(taskData.anfangsdatum) || new Date(),
            faelligkeitsdatum: parseDate(taskData.faelligkeitsdatum),
            abschlussdatum: parseDate(taskData.abschlussdatum),
            prozent: typeof taskData.prozent === "number" ? taskData.prozent : 0,
            erledigt: taskData.erledigt === true || taskData.prozent === 100,
            tags: Array.isArray(taskData.tags) ? taskData.tags : [],
            link: taskData.link || "",
            bilder: Array.isArray(taskData.bilder) ? taskData.bilder : [],
            wiederkehrend: this.parseRecurrence(taskData.wiederkehrend),
            erinnerung: this.parseReminder(taskData.erinnerung),
            notizen: notizen,
            filePath: filePath
        };


        return task;
    }

    private parseRecurrence(data: unknown): TaskModel["wiederkehrend"] {
        if (!data || typeof data !== "object") {
            return { aktiv: false, intervall: null, wert: null };
        }
        const d = data as Record<string, any>;
        return {
            aktiv: d.aktiv === true,
            intervall: d.intervall as RecurrenceInterval | null,
            wert: d.wert ?? null,
            wochentag: d.wochentag ?? null,
            monatstag: d.monatstag ?? null
        };
    }


    private parseReminder(data: unknown): TaskModel["erinnerung"] {
        if (!data || typeof data !== "object") {
            return { aktiv: false, zeit: null };
        }
        const d = data as Record<string, any>;
        return {
            aktiv: d.aktiv === true,
            zeit: d.zeit as ReminderTime | null,
            customMinutes: d.customMinutes ?? null
        };
    }


    async writeTask(task: TaskModel): Promise<string> {
        const settings = this.getSettings();
        await this.ensureFolder(settings.taskFolder);

        const frontmatter: Record<string, unknown> = {

            aufgabe: task.aufgabe,
            bezeichnung: task.bezeichnung,
            prioritaet: priorityToString(task.prioritaet),
            prioritaet_nr: priorityToNumber(task.prioritaet),
            status: task.status as string,
            anfangsdatum: formatDate(task.anfangsdatum, "yyyy-MM-dd"),
            faelligkeitsdatum: task.faelligkeitsdatum
                ? formatDate(task.faelligkeitsdatum, "yyyy-MM-dd")
                : null,
            abschlussdatum: task.abschlussdatum
                ? formatDate(task.abschlussdatum, "yyyy-MM-dd")
                : null,
            prozent: task.prozent,
            erledigt: task.erledigt,
            tags: task.tags,
            link: task.link,
            bilder: task.bilder,
            wiederkehrend: {
                aktiv: task.wiederkehrend.aktiv,
                intervall: task.wiederkehrend.intervall,
                wert: task.wiederkehrend.wert,
                wochentag: task.wiederkehrend.wochentag ?? null,
                monatstag: task.wiederkehrend.monatstag ?? null
            },
            erinnerung: {
                aktiv: task.erinnerung.aktiv,
                zeit: task.erinnerung.zeit,
                customMinutes: task.erinnerung.customMinutes ?? null
            },
            notizen: task.notizen
        };

        let yaml: string;
        try {
            yaml = stringifyYaml(frontmatter);
        } catch {

            // Fallback: manuell serialisieren
            yaml = this.manualStringify(frontmatter);
        }

        const body = task.notizen
            ? `\n## Notizen\n\n${task.notizen}\n`
            : "";
        const content = `---\n${yaml}---\n${body}`;

        if (task.filePath) {
            // Bestehende Datei aktualisieren
            const file = this.app.vault.getAbstractFileByPath(task.filePath);
            if (file && file instanceof TFile) {
                await this.app.vault.modify(file, content);
                return task.filePath;
            }
        }

        // Neue Datei erstellen
        const filename = sanitizeFilename(task.aufgabe) + ".md";
        let filePath = normalizePath(`${settings.taskFolder}/${filename}`);

        // Duplikat-Check
        let counter = 1;
        while (this.app.vault.getAbstractFileByPath(filePath)) {
            filePath = normalizePath(
                `${settings.taskFolder}/${sanitizeFilename(task.aufgabe)}_${counter}.md`
            );
            counter++;
        }

        await this.app.vault.create(filePath, content);
        return filePath;
    }

    async deleteTask(task: TaskModel): Promise<void> {
        if (!task.filePath) return;
        const file = this.app.vault.getAbstractFileByPath(task.filePath);
        if (file && file instanceof TFile) {
            await this.app.fileManager.trashFile(file);
        }

    }

    private manualStringify(obj: Record<string, any>, indent = 0): string {


        let result = "";
        const prefix = "  ".repeat(indent);
        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) {
                result += `${prefix}${key}:\n`;
            } else if (Array.isArray(value)) {
                if (value.length === 0) {
                    result += `${prefix}${key}: []\n`;
                } else {
                    result += `${prefix}${key}:\n`;
                    for (const item of value) {
                        result += `${prefix}  - ${JSON.stringify(item)}\n`;
                    }
                }
            } else if (typeof value === "object") {
                result += `${prefix}${key}:\n`;
                result += this.manualStringify(value, indent + 1);
            } else if (typeof value === "string") {
                result += `${prefix}${key}: "${value.replace(/"/g, '\\"')}"\n`;
            } else {
                result += `${prefix}${key}: ${value}\n`;
            }
        }
        return result;
    }
}
