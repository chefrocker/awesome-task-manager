// ============================================================
// ImageStorage.ts – Bilder speichern und umbenennen
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { App, TFile, normalizePath } from "obsidian";
import { formatDate, sanitizeFilename } from "../core/TaskModel";
import { PluginSettings } from "../settings/SettingsModel";

export class ImageStorage {
    constructor(
        private app: App,
        private getSettings: () => PluginSettings
    ) {}

    private async ensureFolder(folderPath: string): Promise<void> {
        const normalized = normalizePath(folderPath);
        if (normalized === "" || normalized === ".") return;

        const parts = normalized.split("/");
        let currentPath = "";
        for (const part of parts) {
            currentPath = currentPath === "" ? part : `${currentPath}/${part}`;
            const abstractFile = this.app.vault.getAbstractFileByPath(currentPath);
            if (!abstractFile) {
                try {
                    await this.app.vault.createFolder(currentPath);
                } catch (e) {
                    if (!(e instanceof Error && e.message.includes("already exists"))) {
                        throw e;
                    }
                }
            }
        }
    }


    async saveImage(file: File, taskName: string): Promise<string> {
        const settings = this.getSettings();
        await this.ensureFolder(settings.imageFolder);

        const dateStr = formatDate(new Date(), "yyyy-MM-dd");
        const ext = file.name.split(".").pop() || "png";
        const safeName = sanitizeFilename(
            file.name.replace(/\.[^/.]+$/, "")
        );
        const filename = `${dateStr}_${safeName}.${ext}`;
        const filePath = normalizePath(
            `${settings.imageFolder}/${filename}`
        );

        const buffer = await file.arrayBuffer();
        await this.app.vault.createBinary(filePath, buffer);

        return filePath;
    }

    async renameOnComplete(imagePath: string): Promise<string> {
        const file = this.app.vault.getAbstractFileByPath(imagePath);
        if (!file || !(file instanceof TFile)) return imagePath;

        const filename = file.name;
        if (filename.startsWith("Erledigt-")) return imagePath;

        const newFilename = "Erledigt-" + filename;
        const newPath = normalizePath(
            file.parent ? `${file.parent.path}/${newFilename}` : newFilename
        );

        await this.app.vault.rename(file, newPath);
        return newPath;
    }

    async undoRenameOnReopen(imagePath: string): Promise<string> {
        const file = this.app.vault.getAbstractFileByPath(imagePath);
        if (!file || !(file instanceof TFile)) return imagePath;

        const filename = file.name;
        if (!filename.startsWith("Erledigt-")) return imagePath;

        const newFilename = filename.replace(/^Erledigt-/, "");
        const newPath = normalizePath(
            file.parent ? `${file.parent.path}/${newFilename}` : newFilename
        );

        await this.app.vault.rename(file, newPath);
        return newPath;
    }

    getImageUri(imagePath: string): string {
        const file = this.app.vault.getAbstractFileByPath(imagePath);
        if (file && file instanceof TFile) {
            return this.app.vault.getResourcePath(file);
        }
        return "";
    }
}
