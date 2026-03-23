# Technisches Design – Awesome Task Manager

**Projekt:** Awesome Task Manager – Obsidian Plugin
**Autor:** Sandro Ballarini
**Version:** 1.0
**Datum:** 23.03.2026

---

## 1. Klassendiagramm (Vereinfacht)

TaskModel ├── aufgabe: string ├── bezeichnung: string ├── prioritaet: Priority (enum) ├── prioritaet_nr: number ├── status: Status (enum) ├── anfangsdatum: Date ├── faelligkeitsdatum: Date | null ├── abschlussdatum: Date | null ├── prozent: number ├── erledigt: boolean (computed) ├── tags: string[] ├── link: string ├── bilder: string[] ├── wiederkehrend: RecurrenceRule | null ├── erinnerung: ReminderRule | null ├── notizen: string └── filePath: string
TaskManager ├── tasks: TaskModel[] ├── create(data: Partial<TaskModel>): TaskModel ├── update(task: TaskModel, changes: Partial<TaskModel>): TaskModel ├── delete(task: TaskModel): void ├── getAll(): TaskModel[] ├── getFiltered(filters: FilterOptions): TaskModel[] ├── getTodayAndOverdue(): TaskModel[] ├── getThisWeek(): TaskModel[] ├── getOpen(): TaskModel[] ├── applyLogics(task: TaskModel, changes: Partial<TaskModel>): TaskModel └── refresh(): void
TagStore ├── tags: string[] ├── load(): void ├── save(): void ├── addTags(newTags: string[]): void ├── removeTag(tag: string): void ├── renameTag(oldName: string, newName: string): void └── getSuggestions(input: string): string[]
RecurrenceEngine ├── check(task: TaskModel): void ├── createNext(task: TaskModel): TaskModel └── calculateNextDate(rule: RecurrenceRule, from: Date): Date
ReminderEngine ├── start(): void ├── stop(): void ├── checkReminders(): void └── showNotification(task: TaskModel): void
FileStorage ├── readTask(path: string): TaskModel ├── writeTask(task: TaskModel): void ├── deleteTask(task: TaskModel): void ├── readAllTasks(folder: string): TaskModel[] └── parseFrontmatter(content: string): object
ImageStorage ├── saveImage(file: File, taskName: string): string ├── renameOnComplete(imagePath: string): string └── generateFilename(originalName: string): string



---

## 2. Enumerationen

```typescript
enum Priority {
  HIGHEST = 1,   // "Höchste"
  HIGH = 2,      // "Hoch"
  NORMAL = 3,    // "Normal"
  LOW = 4        // "Niedrig"
}
enum Status { OPEN = "Offen", IN_PROGRESS = "in Bearbeitung", COMPLETED = "Abgeschlossen" }
enum RecurrenceInterval { DAILY = "daily", WEEKLY = "weekly", MONTHLY = "monthly", YEARLY = "yearly", CUSTOM = "custom" }
enum ReminderTime { ONE_DAY_BEFORE = "1-day-before", SAME_DAY = "same-day", ONE_HOUR_BEFORE = "1-hour-before", CUSTOM = "custom" }



---

## 3. Interfaces

```typescript
interface FilterOptions {
  tag?: string;
  priority?: Priority;
  bezeichnung?: string;
  searchText?: string;
  tab?: "today" | "week" | "open" | "all";
}
interface RecurrenceRule { aktiv: boolean; intervall: RecurrenceInterval | null; wert: number | null; // z.B. alle 2 Wochen → wert=2 wochentag?: number | null; // 0=Mo, 6=So (für wöchentlich) monatstag?: number | null; // 1-31 (für monatlich) }
interface ReminderRule { aktiv: boolean; zeit: ReminderTime | null; customMinutes?: number | null; }
interface PluginSettings { taskFolder: string; imageFolder: string; language: "de" | "en"; defaultPriority: Priority; defaultTab: "today" | "week" | "open" | "all"; dateFormat: "dd.MM.yyyy" | "yyyy-MM-dd"; dailySummary: boolean; defaultReminderTime: ReminderTime; }
interface ExcelRow { aufgabe: string; bezeichnung: string; prioritaet: string; status: string; anfangsdatum: string; faelligkeitsdatum: string; abschlussdatum: string; prozentAbgeschlossen: string; erledigt: string; // Excel-Formel notizen: string; link: string; }



---

## 4. Logik-Implementierung

### 4.1 applyLogics Pseudocode

```typescript
function applyLogics(task: TaskModel, changes: Partial<TaskModel>): TaskModel {
// Logik A: Status → Abgeschlossen setzt 100% if (changes.status === Status.COMPLETED) { changes.prozent = 100; changes.abschlussdatum = new Date(); changes.erledigt = true; }
// Logik B: 100% setzt Status Abgeschlossen + Datum if (changes.prozent === 100 && task.status !== Status.COMPLETED) { changes.status = Status.COMPLETED; changes.abschlussdatum = new Date(); changes.erledigt = true; }
// Logik C: Offen + % > 0 → in Bearbeitung if (task.status === Status.OPEN && (changes.prozent ?? task.prozent) > 0) { changes.status = Status.IN_PROGRESS; }
// Logik D: % unter 100 → in Bearbeitung + Abschlussdatum leeren if (changes.prozent !== undefined && changes.prozent < 100 && task.prozent === 100) { changes.status = Status.IN_PROGRESS; changes.abschlussdatum = null; changes.erledigt = false; }
return { ...task, ...changes }; }



### 4.2 Excel-Export Pseudocode

```typescript
function exportToExcel(tasks: TaskModel[], settings: PluginSettings): string {
  const header = "AUFGABE\tBezeichnung\tPRIORITÄT\tSTATUS\t" +
    "ANFANGSDATUM\tFÄLLIGKEITSDATUM\tABSCHLUSSDATUM\t" +
    "% ABGESCHLOSSEN\tERLEDIGT?\tNOTIZEN\tLink";
const rows = tasks.map(task => { const notizen = '"' + task.notizen.replace(/"/g, '""') + '"'; const erledigt = '=--([@[% ABGESCHLOSSEN]]>=1)';


return [
  task.aufgabe,
  task.bezeichnung,
  task.prioritaet,
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
return header + "\n" + rows.join("\n"); }



### 4.3 Bild-Umbenennung Pseudocode

```typescript
function saveImage(file: File, taskName: string): string {
  const date = formatDate(new Date(), "yyyy-MM-dd");
  const ext = file.name.split('.').pop();
  const filename = `${date}_${sanitize(file.name)}`;
  // Speichere in imageFolder
  return filename;
}
function renameOnComplete(imagePath: string): string { const filename = getFilename(imagePath); if (!filename.startsWith("Erledigt-")) { const newFilename = "Erledigt-" + filename; // Datei umbenennen return newFilename; } return filename; }



---

## 5. UI-Komponenten Detail

### 5.1 DashboardView

```typescript
class DashboardView extends ItemView {
  // Obsidian Custom View
  // VIEW_TYPE = "awesome-task-dashboard"
// Enthält: // - Header mit Neu-Button und Export-Button // - TabBar Komponente // - FilterBar Komponente // - TaskTable Komponente // - Subscription auf TaskManager Events für Auto-Refresh }



### 5.2 TaskTable Rendering

Die Tabelle wird als HTML-Table gerendert mit:
- thead: Spaltenüberschriften (klickbar für Sortierung)
- tbody: Eine Zeile pro Aufgabe
- Inline-Edit-Felder: Werden per Event-Listener aktiviert
- Farbcodierung: CSS-Klassen basierend auf Prozent-Wert
- Überfällig-Warnung: CSS-Klasse + Icon

### 5.3 Mobile Anpassungen

- TaskTable: Horizontales Scrollen oder reduzierte Spalten
- Detail-Ansicht: Vollbild statt Overlay
- Touch-Events für Inline-Editing
- Grössere Klick-Bereiche für Buttons und Dropdowns

---

## 6. i18n Implementierung

```typescript
// i18n.ts
const translations: Record<string, Record<string, string>> = {};
export function loadLocale(lang: string): void { // Lade locales/{lang}.json }
export function t(key: string): string { return translations[currentLang][key] || key; }
// Verwendung: // t("dashboard.tab.today") → "Heute fällig & Überfällig"



### Locale-Datei Beispiel (de.json Auszug)

```json
{
  "dashboard.title": "Aufgaben-Dashboard",
  "dashboard.tab.today": "Heute fällig & Überfällig",
  "dashboard.tab.week": "Diese Woche fällig",
  "dashboard.tab.open": "Alle offenen Aufgaben",
  "dashboard.tab.all": "Alle Aufgaben",
  "dashboard.button.new": "Neue Aufgabe",
  "dashboard.button.export": "Nach Excel kopieren",
  "task.field.aufgabe": "Aufgabe",
  "task.field.bezeichnung": "Bezeichnung",
  "task.field.prioritaet": "Priorität",
  "task.field.status": "Status",
  "task.status.open": "Offen",
  "task.status.inprogress": "in Bearbeitung",
  "task.status.completed": "Abgeschlossen",
  "task.priority.highest": "Höchste",
  "task.priority.high": "Hoch",
  "task.priority.normal": "Normal",
  "task.priority.low": "Niedrig",
  "notification.overdue": "Aufgabe überfällig",
  "notification.reminder": "Erinnerung",
  "export.success": "In Zwischenablage kopiert",
  "settings.title": "Awesome Task Manager Einstellungen"
}