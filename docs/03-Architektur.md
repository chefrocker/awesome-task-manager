# Architekturdokument – Awesome Task Manager

**Projekt:** Awesome Task Manager – Obsidian Plugin
**Autor:** Sandro Ballarini
**Version:** 1.0
**Datum:** 23.03.2026

---

## 1. Architekturübersicht

Das Plugin folgt einer modularen Schichtenarchitektur mit klarer Trennung
von Daten, Logik und Darstellung. Jedes Modul hat eine einzige
Verantwortung und kommuniziert über definierte Schnittstellen.

+-------------------------------------------------------+ | Obsidian App | +-------------------------------------------------------+ | main.ts (Entry Point) | +-------------------------------------------------------+ | | | +-------------------+ +------------------------+ | | | UI Layer | | Settings Layer | | | | | | | | | | DashboardView | | SettingsTab | | | | TabBar | | SettingsModel | | | | FilterBar | +------------------------+ | | | TaskTable | | | | TaskDetailView | +------------------------+ | | | TaskCreateModal | | i18n Layer | | | | ExportButton | | | | | +--------+----------+ | i18n.ts | | | | | locales/de.json | | | v | locales/en.json | | | +-------------------+ +------------------------+ | | | Core Layer | | | | | | | | TaskManager | | | | TaskModel | | | | TagStore | | | | RecurrenceEngine | | | | ReminderEngine | | | +--------+----------+ | | | | | v | | +-------------------+ | | | Storage Layer | | | | | | | | FileStorage | | | | ImageStorage | | | +-------------------+ | | | +-------------------------------------------------------+ | Obsidian Vault (Dateisystem) | +-------------------------------------------------------+



---

## 2. Schichten

### 2.1 Entry Point (main.ts)

- Registriert das Plugin bei Obsidian
- Initialisiert alle Module
- Registriert Commands, Views, Settings
- Startet ReminderEngine
- Lädt Einstellungen und Tag-Store

### 2.2 UI Layer

Verantwortlich für die gesamte Darstellung. Kein Modul in dieser Schicht
greift direkt auf das Dateisystem zu – alles läuft über den Core Layer.

| Modul            | Verantwortung                                        |
| ---------------- | ---------------------------------------------------- |
| DashboardView    | Custom View Container, orchestriert alle UI-Module   |
| TabBar           | Tab-Navigation (4 Tabs)                              |
| FilterBar        | Filter-Dropdowns und Freitextsuche                   |
| TaskTable        | Tabellen-Rendering, Inline-Editing, Farbcodierung    |
| TaskDetailView   | Vollständige Aufgaben-Bearbeitung                    |
| TaskCreateModal  | Modal für neue Aufgabe                               |
| ExportButton     | Excel-Export in Zwischenablage                        |

### 2.3 Core Layer

Enthält die gesamte Geschäftslogik. Ist unabhängig von der UI und kann
isoliert getestet werden.

| Modul            | Verantwortung                                        |
| ---------------- | ---------------------------------------------------- |
| TaskManager      | CRUD-Operationen, Logiken A-F, Validierung           |
| TaskModel        | TypeScript Interface/Klasse für eine Aufgabe         |
| TagStore         | Tag-Liste laden, speichern, Autocomplete-Daten       |
| RecurrenceEngine | Wiederkehrende Aufgaben erkennen und neue erstellen   |
| ReminderEngine   | Erinnerungen prüfen und Notifications auslösen        |

### 2.4 Storage Layer

Abstrahiert den Zugriff auf das Dateisystem. Nutzt die Obsidian Vault API.

| Modul            | Verantwortung                                        |
| ---------------- | ---------------------------------------------------- |
| FileStorage      | .md Dateien lesen, schreiben, löschen, Frontmatter   |
| ImageStorage     | Bilder speichern, umbenennen, Datumsstempel          |

### 2.5 Settings Layer

| Modul            | Verantwortung                                        |
| ---------------- | ---------------------------------------------------- |
| SettingsTab      | Obsidian Settings Page UI                            |
| SettingsModel    | Datenmodell für Einstellungen, Defaults              |

### 2.6 i18n Layer

| Modul            | Verantwortung                                        |
| ---------------- | ---------------------------------------------------- |
| i18n.ts          | Sprachauswahl, Übersetzungsfunktion t()              |
| locales/*.json   | Übersetzungsdateien                                  |

---

## 3. Datenfluss

### 3.1 Aufgabe erstellen

Nutzer → TaskCreateModal → TaskManager.create() → FileStorage.write() ↓ TagStore.addTags() ↓ DashboardView.refresh()



### 3.2 Aufgabe inline bearbeiten

Nutzer → TaskTable (Inline-Edit) → TaskManager.update() ↓ Logiken A-F prüfen ↓ FileStorage.write() ↓ RecurrenceEngine.check() ↓ TaskTable.refresh()



### 3.3 Excel-Export

Nutzer → ExportButton → TaskManager.getFiltered() ↓ ExportButton.formatForExcel() ↓ Zwischenablage (navigator.clipboard)



---

## 4. Erweiterbarkeit

Die modulare Architektur ermöglicht folgende Erweiterungen ohne
bestehenden Code zu ändern:

| Erweiterung          | Wie                                           |
| -------------------- | --------------------------------------------- |
| Neue Sprache         | Neue JSON-Datei in locales/ hinzufügen        |
| Neues Feld           | TaskModel erweitern + UI anpassen             |
| Neuer Filter         | FilterBar erweitern                           |
| Neuer Tab            | TabBar + DashboardView erweitern              |
| Neuer Export-Format  | Neues Modul neben ExportButton                |
| Neue Logik           | TaskManager.update() erweitern                |
| Kalenderansicht      | Neues UI-Modul neben TaskTable                |
| API für andere Plugins| TaskManager public methods exponieren         |

---

## 5. Dateistruktur im Vault

Vault/ ├── Aufgaben/ ← Konfigurierbar │ ├── Jens GLC neue Trends.md │ ├── Servicebeschreibung.md │ └── ... ├── Anhaenge/ ← Konfigurierbar │ ├── 2026-03-23_foto.png │ ├── Erledigt-2026-03-18_scan.pdf │ └── ... └── .awesome-tasks/ └── tags.json ← Tag-Speicher



---

## 6. Technische Entscheidungen

| Entscheidung                    | Begründung                              |
| ------------------------------- | --------------------------------------- |
| Custom View statt Markdown      | Kein Quelltext sichtbar, volle UI-Kontrolle |
| YAML Frontmatter für Daten      | Obsidian-Standard, lesbar, erweiterbar  |
| Eigene Tag-JSON statt Obsidian-Tags | Unabhängigkeit, Autocomplete-Kontrolle |
| esbuild als Bundler             | Obsidian-Standard, schnell              |
| Keine externen Libraries        | Keine Abhängigkeitskonflikte, klein     |