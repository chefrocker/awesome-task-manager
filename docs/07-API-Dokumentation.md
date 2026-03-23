# API-Dokumentation – Awesome Task Manager

**Version:** 1.0
**Autor:** Sandro Ballarini
**Datum:** 23.03.2026

---

## 1. Übersicht

Diese Dokumentation beschreibt die internen Module und deren öffentliche
Schnittstellen. Sie dient Entwicklern die das Plugin erweitern möchten.

---

## 2. TaskModel

### Beschreibung
Repräsentiert eine einzelne Aufgabe mit allen Feldern.

### Felder

| Feld              | Typ                   | Pflicht | Beschreibung             |
| ----------------- | --------------------- | ------- | ------------------------ |
| aufgabe           | string                | Ja      | Titel                    |
| bezeichnung       | string                | Nein    | Kategorie/Projekt        |
| prioritaet        | Priority              | Ja      | Enum                     |
| prioritaet_nr     | number                | Auto    | 1-4                      |
| status            | Status                | Auto    | Enum                     |
| anfangsdatum      | Date                  | Auto    | Erstelldatum             |
| faelligkeitsdatum | Date oder null        | Nein    | Deadline                 |
| abschlussdatum    | Date oder null        | Auto    | Bei 100%                 |
| prozent           | number                | Ja      | 0-100                    |
| erledigt          | boolean               | Auto    | true wenn 100%           |
| tags              | string[]              | Nein    | Tag-Liste                |
| link              | string                | Nein    | URL                      |
| bilder            | string[]              | Nein    | Bild-Pfade               |
| wiederkehrend     | RecurrenceRule / null  | Nein    | Wiederholung             |
| erinnerung        | ReminderRule / null    | Nein    | Erinnerung               |
| notizen           | string                | Nein    | Freitext                 |
| filePath          | string                | Auto    | Pfad zur .md Datei       |

---

## 3. TaskManager

### Methoden

#### create(data: Partial<TaskModel>): Promise<TaskModel>
Erstellt eine neue Aufgabe. Setzt Defaults für fehlende Felder.

#### update(task: TaskModel, changes: Partial<TaskModel>): Promise<TaskModel>
Aktualisiert eine Aufgabe. Führt automatisch Logiken A-F aus.

#### delete(task: TaskModel): Promise<void>
Löscht eine Aufgabe und deren .md-Datei.

#### getAll(): TaskModel[]
Gibt alle Aufgaben zurück.

#### getFiltered(filters: FilterOptions): TaskModel[]
Gibt gefilterte Aufgaben zurück.

#### getTodayAndOverdue(): TaskModel[]
Gibt heute fällige und überfällige Aufgaben zurück.

#### getThisWeek(): TaskModel[]
Gibt diese Woche fällige Aufgaben zurück.

#### getOpen(): TaskModel[]
Gibt alle offenen Aufgaben zurück (% < 100).

#### refresh(): Promise<void>
Lädt alle Aufgaben neu aus dem Dateisystem.

---

## 4. TagStore

### Methoden

#### load(): Promise<void>
Lädt Tags aus .awesome-tasks/tags.json

#### save(): Promise<void>
Speichert Tags nach .awesome-tasks/tags.json

#### addTags(newTags: string[]): void
Fügt neue Tags hinzu (ohne Duplikate).

#### removeTag(tag: string): void
Entfernt einen Tag.

#### renameTag(oldName: string, newName: string): void
Benennt einen Tag um.

#### getSuggestions(input: string): string[]
Gibt passende Tag-Vorschläge für Autocomplete zurück.

---

## 5. RecurrenceEngine

### Methoden

#### check(task: TaskModel): Promise<void>
Prüft ob ein abgeschlossener Task wiederkehrend ist und erstellt ggf.
eine neue Aufgabe.

#### createNext(task: TaskModel): Promise<TaskModel>
Erstellt die nächste Instanz einer wiederkehrenden Aufgabe.

#### calculateNextDate(rule: RecurrenceRule, from: Date): Date
Berechnet das nächste Fälligkeitsdatum.

---

## 6. FileStorage

### Methoden

#### readTask(path: string): Promise<TaskModel>
Liest eine .md-Datei und parst das Frontmatter zu einem TaskModel.

#### writeTask(task: TaskModel): Promise<void>
Schreibt ein TaskModel als .md-Datei mit YAML-Frontmatter.

#### deleteTask(task: TaskModel): Promise<void>
Löscht die .md-Datei einer Aufgabe.

#### readAllTasks(folder: string): Promise<TaskModel[]>
Liest alle .md-Dateien aus einem Ordner und gibt TaskModel-Array zurück.

---

## 7. Erweiterung des Plugins

### Neue Sprache hinzufügen

1. Erstelle eine neue Datei `src/i18n/locales/xx.json`
2. Kopiere `de.json` als Vorlage
3. Übersetze alle Werte
4. Registriere die Sprache in `i18n.ts`
5. Füge die Option in `SettingsTab.ts` hinzu

### Neues Feld hinzufügen

1. Erweitere das Interface in `TaskModel.ts`
2. Erweitere `FileStorage.ts` (Frontmatter lesen/schreiben)
3. Erweitere `TaskCreateModal.ts` (Eingabefeld)
4. Erweitere `TaskDetailView.ts` (Bearbeitungsfeld)
5. Optional: Erweitere `TaskTable.ts` (Spalte in Tabelle)
6. Optional: Erweitere `ExportButton.ts` (Export-Spalte)
