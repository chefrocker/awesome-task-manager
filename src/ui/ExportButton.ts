// ============================================================
// ExportButton.ts – Excel-Export in Zwischenablage
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { Notice } from "obsidian";
import { TaskModel, formatDate } from "../core/TaskModel";
import { PluginSettings } from "../settings/SettingsModel";
import { t } from "../i18n/i18n";

export class ExportButton {
    constructor(private getSettings: () => PluginSettings) {}

    createButton(container: HTMLElement, getTasks: () => TaskModel[]): void {
        const btn = container.createEl("button", {
            text: t("dashboard.button.export"),
            cls: "atm-export-button"
        });

        btn.addEventListener("click", () => {
            void (async () => {
                const tasks = getTasks();
                await this.exportToClipboard(tasks);
            })();
        });
    }

    async exportToClipboard(tasks: TaskModel[]): Promise<void> {
        try {
            const text = this.formatForExcel(tasks);
            await navigator.clipboard.writeText(text);
            new Notice(t("export.success"), 3000);
        } catch (e) {
            console.error("Export error:", e);
            new Notice(t("export.error"), 5000);
        }
    }

    formatForExcel(tasks: TaskModel[]): string {
        const settings = this.getSettings();

        const header = [
            "AUFGABE",
            "Bezeichnung",
            "PRIORITÄT",
            "STATUS",
            "ANFANGSDATUM",
            "FÄLLIGKEITSDATUM",
            "ABSCHLUSSDATUM",
            "% ABGESCHLOSSEN",
            "ERLEDIGT?",
            "NOTIZEN",
            "Link"
        ].join("\t");

        const rows = tasks.map((task) => {
            // Mehrzeilige Notizen in Anführungszeichen
            const notizen = task.notizen
                ? '"' + task.notizen.replace(/"/g, '""') + '"'
                : "";

            // Excel-Formel für ERLEDIGT
            const erledigt = '=--([@[% ABGESCHLOSSEN]]>=1)';

            return [
                task.aufgabe,
                task.bezeichnung,
                this.priorityToDisplayString(task.prioritaet),
                task.status,
                formatDate(task.anfangsdatum, settings.dateFormat),
                formatDate(task.faelligkeitsdatum, settings.dateFormat),
                formatDate(task.abschlussdatum, settings.dateFormat),
                task.prozent + "%",
                erledigt,
                notizen,
                task.link
            ].join("\t");
        });

        return header + "\n" + rows.join("\n");
    }

    private priorityToDisplayString(p: number): string {
        switch (p) {
            case 1: return t("task.priority.highest");
            case 2: return t("task.priority.high");
            case 3: return t("task.priority.normal");
            case 4: return t("task.priority.low");
            default: return t("task.priority.normal");
        }
    }
}
