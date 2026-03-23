// ============================================================
// TaskManager.ts – CRUD, Logiken A-F, Filter, Sortierung
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import {
    TaskModel,
    Status,
    Priority,
    FilterOptions,
    createDefaultTask,
    priorityToNumber,
    isToday,
    isOverdue,
    isThisWeek,
    priorityFromString
} from "./TaskModel";
import { FileStorage } from "../storage/FileStorage";
import { ImageStorage } from "../storage/ImageStorage";
import { TagStore } from "./TagStore";
import { PluginSettings } from "../settings/SettingsModel";

export class TaskManager {
    tasks: TaskModel[] = [];
    private onRefreshCallbacks: (() => void)[] = [];

    constructor(
        private fileStorage: FileStorage,
        private imageStorage: ImageStorage,
        private tagStore: TagStore,
        private getSettings: () => PluginSettings
    ) {}

    onRefresh(callback: () => void): void {
        this.onRefreshCallbacks.push(callback);
    }

    private notifyRefresh(): void {
        for (const cb of this.onRefreshCallbacks) {
            cb();
        }
    }

    async refresh(): Promise<void> {
        this.tasks = await this.fileStorage.readAllTasks();
        this.notifyRefresh();
    }

    async create(data: Partial<TaskModel>): Promise<TaskModel> {
        const settings = this.getSettings();
        const task = createDefaultTask();

        // Pflichtfelder
        task.aufgabe = data.aufgabe || "Neue Aufgabe";
        task.bezeichnung = data.bezeichnung || "";
        task.prioritaet = data.prioritaet ?? settings.defaultPriority;
        task.prioritaet_nr = priorityToNumber(task.prioritaet);
        task.status = data.status ?? Status.OPEN;
        task.anfangsdatum = data.anfangsdatum ?? new Date();
        task.faelligkeitsdatum = data.faelligkeitsdatum ?? null;
        task.abschlussdatum = data.abschlussdatum ?? null;
        task.prozent = data.prozent ?? 0;
        task.erledigt = task.prozent >= 100;
        task.tags = data.tags ? [...data.tags] : [];
        task.link = data.link || "";
        task.bilder = data.bilder ? [...data.bilder] : [];
        task.wiederkehrend = data.wiederkehrend || {
            aktiv: false,
            intervall: null,
            wert: null
        };
        task.erinnerung = data.erinnerung || {
            aktiv: false,
            zeit: null
        };
        task.notizen = data.notizen || "";

        // Tags lernen
        if (task.tags.length > 0) {
            this.tagStore.addTags(task.tags);
        }

        // Datei schreiben
        const filePath = await this.fileStorage.writeTask(task);
        task.filePath = filePath;

        this.tasks.push(task);
        this.notifyRefresh();
        return task;
    }

    async update(
        task: TaskModel,
        changes: Partial<TaskModel>
    ): Promise<TaskModel> {
        // Logiken A-F anwenden
        const processed = this.applyLogics(task, changes);

        // Task aktualisieren
        Object.assign(task, processed);

        // Priorität-Nummer synchronisieren
        task.prioritaet_nr = priorityToNumber(task.prioritaet);
        task.erledigt = task.prozent >= 100;

        // Tags lernen
        if (task.tags.length > 0) {
            this.tagStore.addTags(task.tags);
        }

        // Bilder umbenennen bei Abschluss
        if (
            task.status === Status.COMPLETED &&
            task.bilder.length > 0
        ) {
            const updatedBilder: string[] = [];
            for (const bild of task.bilder) {
                const newPath =
                    await this.imageStorage.renameOnComplete(bild);
                updatedBilder.push(newPath);
            }
            task.bilder = updatedBilder;
        }

        // Bilder-Umbenennung rückgängig machen wenn wieder geöffnet
        if (
            task.status !== Status.COMPLETED &&
            task.bilder.length > 0
        ) {
            const updatedBilder: string[] = [];
            for (const bild of task.bilder) {
                const newPath =
                    await this.imageStorage.undoRenameOnReopen(bild);
                updatedBilder.push(newPath);
            }
            task.bilder = updatedBilder;
        }

        // Datei speichern
        await this.fileStorage.writeTask(task);
        this.notifyRefresh();
        return task;
    }

    async delete(task: TaskModel): Promise<void> {
        await this.fileStorage.deleteTask(task);
        const index = this.tasks.indexOf(task);
        if (index !== -1) {
            this.tasks.splice(index, 1);
        }
        this.notifyRefresh();
    }

    applyLogics(
        task: TaskModel,
        changes: Partial<TaskModel>
    ): Partial<TaskModel> {
        const result = { ...changes };

        // Logik A: Status → Abgeschlossen setzt 100%
        if (result.status === Status.COMPLETED) {
            result.prozent = 100;
            result.abschlussdatum = new Date();
            result.erledigt = true;
        }

        // Logik B: 100% setzt Status Abgeschlossen + Datum
        if (
            result.prozent !== undefined &&
            result.prozent >= 100 &&
            task.status !== Status.COMPLETED &&
            result.status !== Status.COMPLETED
        ) {
            result.status = Status.COMPLETED;
            result.abschlussdatum = new Date();
            result.erledigt = true;
            result.prozent = 100;
        }

        // Logik C: Offen + % > 0 → in Bearbeitung
        const effectiveStatus = result.status ?? task.status;
        const effectivePercent = result.prozent ?? task.prozent;
        if (
            effectiveStatus === Status.OPEN &&
            effectivePercent > 0 &&
            effectivePercent < 100
        ) {
            result.status = Status.IN_PROGRESS;
        }

        // Logik D: % unter 100 (war vorher 100) → in Bearbeitung + Datum leeren
        if (
            result.prozent !== undefined &&
            result.prozent < 100 &&
            task.prozent >= 100
        ) {
            result.status = Status.IN_PROGRESS;
            result.abschlussdatum = null;
            result.erledigt = false;
        }

        return result;
    }

    // ---- Abfrage-Methoden ----

    getAll(): TaskModel[] {
        return [...this.tasks];
    }

    getOpen(): TaskModel[] {
        return this.tasks.filter((t) => t.prozent < 100);
    }

    getTodayAndOverdue(): TaskModel[] {
        return this.tasks.filter((task) => {
            if (task.prozent >= 100) return false;
            if (!task.faelligkeitsdatum) return false;
            return (
                isToday(task.faelligkeitsdatum) ||
                isOverdue(task.faelligkeitsdatum)
            );
        });
    }

    getThisWeek(): TaskModel[] {
        return this.tasks.filter((task) => {
            if (task.prozent >= 100) return false;
            if (!task.faelligkeitsdatum) return false;
            return isThisWeek(task.faelligkeitsdatum);
        });
    }

    getFiltered(filters: FilterOptions): TaskModel[] {
        let result: TaskModel[];

        // Tab-Filter
        switch (filters.tab) {
            case "today":
                result = this.getTodayAndOverdue();
                break;
            case "week":
                result = this.getThisWeek();
                break;
            case "open":
                result = this.getOpen();
                break;
            case "all":
            default:
                result = this.getAll();
                break;
        }

        // Tag-Filter
        if (filters.tag) {
            result = result.filter((task) =>
                task.tags.includes(filters.tag!)
            );
        }

        // Priorität-Filter
        if (filters.priority !== undefined) {
            result = result.filter(
                (task) => task.prioritaet === filters.priority
            );
        }

        // Bezeichnung-Filter
        if (filters.bezeichnung) {
            result = result.filter(
                (task) => task.bezeichnung === filters.bezeichnung
            );
        }

        // Freitextsuche
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            result = result.filter((task) => {
                return (
                    task.aufgabe.toLowerCase().includes(search) ||
                    task.bezeichnung.toLowerCase().includes(search) ||
                    task.notizen.toLowerCase().includes(search) ||
                    task.tags.some((tag) =>
                        tag.toLowerCase().includes(search)
                    ) ||
                    task.link.toLowerCase().includes(search) ||
                    task.status.toLowerCase().includes(search)
                );
            });
        }

        // Sortierung: Priorität (aufsteigend), dann Fälligkeitsdatum
        result.sort((a, b) => {
            if (a.prioritaet_nr !== b.prioritaet_nr) {
                return a.prioritaet_nr - b.prioritaet_nr;
            }
            const aDate = a.faelligkeitsdatum?.getTime() || Infinity;
            const bDate = b.faelligkeitsdatum?.getTime() || Infinity;
            return aDate - bDate;
        });

        return result;
    }

    // Alle eindeutigen Bezeichnungen
    getAllBezeichnungen(): string[] {
        const set = new Set<string>();
        for (const task of this.tasks) {
            if (task.bezeichnung) {
                set.add(task.bezeichnung);
            }
        }
        return Array.from(set).sort();
    }

    getTaskByPath(filePath: string): TaskModel | undefined {
        return this.tasks.find((t) => t.filePath === filePath);
    }
}
