// ============================================================
// RecurrenceEngine.ts – Wiederkehrende Aufgaben
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import {
    TaskModel,
    RecurrenceInterval,
    Status
} from "./TaskModel";

import { TaskManager } from "./TaskManager";

export class RecurrenceEngine {
    constructor(private taskManager: TaskManager) {}

    async check(task: TaskModel): Promise<void> {
        if (
            !task.wiederkehrend.aktiv ||
            !task.wiederkehrend.intervall ||
            task.status !== Status.COMPLETED
        ) {
            return;
        }

        await this.createNext(task);
    }

    async createNext(task: TaskModel): Promise<TaskModel> {
        const nextDate = this.calculateNextDate(
            task.wiederkehrend,
            task.faelligkeitsdatum || task.anfangsdatum
        );

        const newTask: Partial<TaskModel> = {
            aufgabe: task.aufgabe,
            bezeichnung: task.bezeichnung,
            prioritaet: task.prioritaet,
            tags: [...task.tags],
            link: task.link,
            notizen: task.notizen,
            wiederkehrend: { ...task.wiederkehrend },
            erinnerung: { ...task.erinnerung },
            faelligkeitsdatum: nextDate,
            // Reset-Felder
            prozent: 0,
            status: Status.OPEN,
            anfangsdatum: new Date(),
            abschlussdatum: null,
            erledigt: false,
            bilder: []
        };

        return await this.taskManager.create(newTask);
    }

    calculateNextDate(
        rule: TaskModel["wiederkehrend"],
        from: Date
    ): Date {
        const base = new Date(from);
        const wert = rule.wert || 1;

        switch (rule.intervall) {
            case RecurrenceInterval.DAILY:
                base.setDate(base.getDate() + wert);
                break;

            case RecurrenceInterval.WEEKLY:
                base.setDate(base.getDate() + 7 * wert);
                // Wenn ein bestimmter Wochentag gewünscht ist
                if (
                    rule.wochentag !== null &&
                    rule.wochentag !== undefined
                ) {
                    const currentDay = base.getDay();
                    // getDay(): 0=So, 1=Mo ... 6=Sa
                    // rule.wochentag: 0=Mo, 6=So
                    const targetDay =
                        rule.wochentag === 6 ? 0 : rule.wochentag + 1;
                    const diff = targetDay - currentDay;
                    base.setDate(base.getDate() + diff);
                }
                break;

            case RecurrenceInterval.MONTHLY:
                base.setMonth(base.getMonth() + wert);
                if (
                    rule.monatstag !== null &&
                    rule.monatstag !== undefined
                ) {
                    base.setDate(
                        Math.min(
                            rule.monatstag,
                            new Date(
                                base.getFullYear(),
                                base.getMonth() + 1,
                                0
                            ).getDate()
                        )
                    );
                }
                break;

            case RecurrenceInterval.YEARLY:
                base.setFullYear(base.getFullYear() + wert);
                break;

            case RecurrenceInterval.CUSTOM:
                base.setDate(base.getDate() + wert);
                break;

            default:
                base.setDate(base.getDate() + 1);
                break;
        }

        return base;
    }
}
