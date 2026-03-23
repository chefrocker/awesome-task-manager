// ============================================================
// i18n.ts – Internationalisierung
// Awesome Task Manager – Obsidian Plugin
// ============================================================

import de from "./locales/de.json";
import en from "./locales/en.json";

const translations: Record<string, Record<string, string>> = {
    de: de as Record<string, string>,
    en: en as Record<string, string>
};

let currentLang = "de";

export function setLanguage(lang: string): void {
    if (translations[lang]) {
        currentLang = lang;
    }
}

export function getLanguage(): string {
    return currentLang;
}

export function t(key: string): string {
    const lang = translations[currentLang];
    if (lang && lang[key]) {
        return lang[key];
    }
    // Fallback to German
    if (translations["de"] && translations["de"][key]) {
        return translations["de"][key];
    }
    return key;
}

export function getAvailableLanguages(): string[] {
    return Object.keys(translations);
}
