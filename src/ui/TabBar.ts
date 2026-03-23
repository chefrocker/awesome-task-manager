// ============================================================
// TabBar.ts – Tab-Navigation (4 Tabs)
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import { t } from "../i18n/i18n";

export type TabId = "today" | "week" | "open" | "all";

export interface TabBarCallbacks {
    onTabChange: (tab: TabId) => void;
}

export class TabBar {
    private container: HTMLElement;
    private callbacks: TabBarCallbacks;

    constructor(container: HTMLElement, callbacks: TabBarCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
    }

    render(activeTab: TabId): void {
        this.container.empty();
        this.container.addClass("atm-tabbar");

        const tabs: { id: TabId; labelKey: string }[] = [
            { id: "today", labelKey: "dashboard.tab.today" },
            { id: "week", labelKey: "dashboard.tab.week" },
            { id: "open", labelKey: "dashboard.tab.open" },
            { id: "all", labelKey: "dashboard.tab.all" }
        ];

        for (const tab of tabs) {
            const btn = this.container.createEl("button", {
                text: t(tab.labelKey),
                cls: `atm-tab-button ${
                    tab.id === activeTab ? "atm-tab-active" : ""
                }`
            });

            btn.addEventListener("click", () => {
                this.callbacks.onTabChange(tab.id);
            });
        }
    }
}
