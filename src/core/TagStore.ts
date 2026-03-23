// ============================================================
// TagStore.ts – Tag-Verwaltung mit Persistenz
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { App, TFile, normalizePath } from "obsidian";

const TAG_STORE_PATH = ".awesome-tasks/tags.json";

export class TagStore {
    tags: string[] = [];

    constructor(private app: App) {}

    async load(): Promise<void> {
        try {
            const path = normalizePath(TAG_STORE_PATH);
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file && file instanceof TFile) {
                const content = await this.app.vault.read(file);
                const data = JSON.parse(content);
                this.tags = Array.isArray(data.tags) ? data.tags : [];
            }
        } catch {
            console.debug("TagStore: No existing tags found, starting fresh.");
            this.tags = [];
        }

    }

    async save(): Promise<void> {
        try {
            const folderPath = normalizePath(".awesome-tasks");
            const folder = this.app.vault.getAbstractFileByPath(folderPath);
            if (!folder) {
                try {
                    await this.app.vault.createFolder(folderPath);
                } catch (e) {
                    if (!(e instanceof Error && e.message.includes("already exists"))) {
                        throw e;
                    }
                }
            }


            const path = normalizePath(TAG_STORE_PATH);
            const content = JSON.stringify({ tags: this.tags }, null, 2);
            const file = this.app.vault.getAbstractFileByPath(path);

            if (file && file instanceof TFile) {
                await this.app.vault.modify(file, content);
            } else {
                await this.app.vault.create(path, content);
            }
        } catch (e) {
            console.error("TagStore: Error saving tags", e);
        }
    }

    addTags(newTags: string[]): void {
        let changed = false;
        for (const tag of newTags) {
            const trimmed = tag.trim();
            if (trimmed && !this.tags.includes(trimmed)) {
                this.tags.push(trimmed);
                changed = true;
            }
        }
        if (changed) {
            this.tags.sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase())
            );
            void this.save();

        }
    }

    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.splice(index, 1);
            void this.save();

        }
    }

    renameTag(oldName: string, newName: string): void {
        const index = this.tags.indexOf(oldName);
        if (index !== -1) {
            this.tags[index] = newName.trim();
            this.tags.sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase())
            );
            void this.save();

        }
    }

    getSuggestions(input: string): string[] {
        if (!input) return [...this.tags];
        const lower = input.toLowerCase();
        return this.tags.filter((tag) =>
            tag.toLowerCase().includes(lower)
        );
    }

    getAllTags(): string[] {
        return [...this.tags];
    }
}
