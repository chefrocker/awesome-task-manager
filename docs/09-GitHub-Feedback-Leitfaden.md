# Entwicklungs-Richtlinien & GitHub-Feedback (Leitfaden)

Dieses Dokument dient als Checkliste, um die bei der GitHub-Review (PR #11303) festgestellten Fehler zukünftig zu vermeiden. Alle hier aufgeführten Punkte sind zwingend für die Aufnahme in den Obsidian Community Store.

---

## 🛑 1. Zwingende Anforderungen (Required)

### 1.1 Logging & Konsole
- **Nur erlaubt:** `console.warn()`, `console.error()`, `console.debug()`.
- **Verboten:** `console.log()` muss entfernt oder durch eine der erlaubten Methoden ersetzt werden.

### 1.2 Promise-Handling (Async/Await)
- Jedes Promise **muss** entweder:
    - mit `await` erwartet werden.
    - mit `.catch()` oder einem Rejection-Handler in `.then()` enden.
    - explizit mit dem `void`-Operator als ignoriert markiert werden (z. B. `void this.app.vault.save(...)`).
- Async-Methoden ohne `await` sollten nicht `async` markiert sein.

### 1.3 UI-Texte (Sentence Case)
- Alle Texte in der Benutzeroberfläche (Labels, Buttons, Menüs) müssen im **Sentence case** geschrieben werden (erster Buchstabe groß, Rest klein - außer Eigennamen).
- *Beispiel:* "Task folder path" statt "Task Folder Path".

### 1.4 Plugin-Lebenszyklus (`onunload`)
- Die Methode `onunload()` darf **keinen** Promise zurückgeben (nicht `async` sein).
- **Kein `detach()` von Leaves:** In `onunload()` dürfen Leaves nicht mit `.detach()` geschlossen werden, da dies die Position des Tabs für den Nutzer beim nächsten Laden zurücksetzt.

### 1.5 Typsicherheit
- **Kein `any`:** Die Verwendung von `any` ist strikt untersagt. Es müssen immer spezifische Typen oder Interfaces definiert werden.
- **Typ-Zusicherungen:** Vermeide unnötige `as ...` Zusicherungen, wenn sie den Typ des Ausdrucks nicht tatsächlich ändern.

### 1.6 Obsidian UI-Standards
- **Settings:** Nutze `new Setting(containerEl).setName(...).setHeading()` für Überschriften in den Einstellungen, anstatt direkt HTML-Header-Elemente (`h2`, `h3`) zu erstellen.
- **Kein natives `confirm()`:** Nutze niemals das Standard-Javascript `confirm()`. Verwende stattdessen Obsidian-Modals.
- **CSS statt Inline-Styles:** Setze keine Styles direkt via `element.style.display` oder `element.style.fontWeight`. Nutze stattdessen CSS-Klassen oder die Obsidian-Funktion `setCssProps`.

---

## ⚠️ 2. Optionale Empfehlungen & Cleanup

### 2.1 Code-Hygiene
- **Unbenutzte Variablen:** Entferne alle definierten, aber nicht genutzten Variablen, Imports oder Funktionen (z. B. `e` in catch-Blöcken, unbenutzte Helper).
- **Enum-Vergleiche:** Achte darauf, dass Vergleiche zwischen Werten denselben Enum-Typ teilen.

### 2.2 Dateisystem-Operationen
- Nutze `this.app.fileManager.trashFile()` anstelle von `this.app.vault.delete()`, um die Papierkorb-Einstellungen des Nutzers zu respektieren.

---

## 🛠 3. Lokale Überprüfung

Um diese Fehler vor dem nächsten Push zu finden:
1. Installiere das [eslint-plugin-obsidian](https://github.com/obsidianmd/eslint-plugin).
2. Führe den Linter lokal aus.

---

## 📝 Update PR #11303 Review (23.03.2026) – Fehlerkorrektur

Folgende Korrekturen wurden am Plugin vorgenommen, um den Review-Anforderungen zu entsprechen:

### 1. Korrektur der zwingenden Anforderungen (Required)
- **main.ts (L167):** `revealLeaf(leaf)` wird nun korrekt mit `void` markiert, da es ein Promise zurückgeben kann.
- **SettingsTab.ts / TaskCreateModal.ts / TaskDetailView.ts:** UI-Texte und Placeholders wurden auf *Sentence case* umgestellt:
  - `"Dd.MM.yyyy"` -> `"dd.MM.yyyy"`
  - `"Tag1, Tag2, ..."` -> `"tag1, tag2, ..."`
  - `"Https://..."` -> `"https://..."`
  - `"Intervall-Wert"` wurde in die Sprachdateien verschoben und übersetzt.
- **FileStorage.ts:** Alle Vorkommen von `any` wurden entfernt und durch `Record<string, unknown>` mit typsicheren Zugriffen ersetzt.
- **ExportButton.ts:** Im Event-Listener (`click`) wird das Promise nun sicher in einen `void`-Block gewrappt.
- **TaskTable.ts:** Unnötige Typ-Zusicherungen (`as HTMLInputElement`) beim Erstellen von Elementen wurden entfernt.

### 2. Optionale Optimierungen (Optional)
- **DashboardView.ts:** Der unbenutzte Import `TaskTableCallbacks` wurde entfernt.

Alle Probleme aus dem automatisierten Scan sind damit behoben.

---

## 📝 Update PR #11303 Review (28.03.2026) – Sentence Case & i18n Compliance

Nach dem automatisierten Re-Scan des ObsidianReviewBot wurden weitere Anforderungen identifiziert:

### 🎯 Korrekturen (Version 1.0.5)

#### 1. UI-Texte: Sentence Case korrekt implementiert
**Problem:** Placeholders und Dropdown-Options waren nicht im Sentence Case oder hatten eslint-disable Workarounds.

**Lösung:**
- Alle Placeholders mit `t()` Funktionen ersetzt (nicht hardcoded)
- Datumsformat-Labels durch i18n-Keys (`settings.dateFormat.european`, `settings.dateFormat.iso`) ersetzt
- ESLint-Disable Kommentare entfernt (der Bot scannt Quellcode, nicht eslint Output)

**Betroffene Dateien:**
- `src/settings/SettingsTab.ts` (L127-128): Date Format Optionen
- `src/ui/TaskCreateModal.ts` (L118, L165): Tag- und URL-Placeholders
- `src/ui/TaskDetailView.ts` (L262): URL-Placeholder

#### 2. Hardcoded Strings → i18n Migrations
**Problem:** Deutsche Strings waren direkt im Code statt in Translations-Dateien.

**Lösung:**
- Neuen i18n-Schlüssel hinzugefügt: `task.placeholder.newTag`
- Neuen i18n-Schlüssel hinzugefügt: `task.default.name`
- `TaskDetailView.ts` (L348): `"Neuer Tag..."` → `t("task.placeholder.newTag")`
- `TaskManager.ts` (L53): `"Neue Aufgabe"` → `t("task.default.name")`
- Import hinzugefügt: `import { t } from "../i18n/i18n";`

#### 3. i18n Locale-Dateien aktualisiert
**Neue Keys in `en.json`:**
```json
{
  "task.placeholder.tags": "Tag1, tag2, ...",
  "task.placeholder.link": "Enter URL...",
  "task.placeholder.newTag": "New tag...",
  "task.default.name": "New task",
  "settings.dateFormat.european": "European (dd.MM.yyyy)",
  "settings.dateFormat.iso": "ISO (yyyy-MM-dd)"
}
```

**Neue Keys in `de.json`:**
```json
{
  "task.placeholder.tags": "Tag1, Tag2, ...",
  "task.placeholder.link": "URL eingeben...",
  "task.placeholder.newTag": "Neuer Tag...",
  "task.default.name": "Neue Aufgabe",
  "settings.dateFormat.european": "Europäisch (TT.MM.JJJJ)",
  "settings.dateFormat.iso": "ISO (JJJJ-MM-TT)"
}
```

#### 4. Code-Cleanup
- Überflüssige Doppel-Leerzeilen entfernt (DashboardView, TaskDetailView, TaskTable, SettingsTab, etc.)
- Doppel-Leerzeilen in JSON-Config-Dateien entfernt
- Version Bump: 1.0.4 → 1.0.5 (package.json, manifest.json, versions.json)

### ✅ Lessons Learned: Sentence Case & i18n Best Practices

**Wichtigste Erkenntnisse:**
1. **Nie hardcoded UI-Strings schreiben** - Immer in i18n-Dateien definieren und mit `t()` nutzen
2. **ESLint-Disable Kommentare helfen nicht** - Der Bot scannt Quellcode direkt, nicht eslint Output
3. **Sentence Case überall** - Auch bei Placeholders, Date Formats und Dropdown-Options
4. **Naming Convention für i18n Keys:**
   - `domain.type.property` (z.B. `task.placeholder.tags`)
   - Aussagekräftig und hierarchisch organisiert
5. **Immer beide Locale-Dateien updaten** - en.json UND de.json müssen identische Keys haben

### 📋 Checkliste für zukünftige Beiträge

Vor jedem Push prüfen:
- [ ] Keine hardcoded UI-Strings im Code
- [ ] Alle User-facing Strings verwenden `t()` Funktion
- [ ] Neue i18n Keys in BEIDEN Locale-Dateien (en.json + de.json)
- [ ] Sentence Case für alle UI-Texte
- [ ] Keine eslint-disable Kommentare für UI-Text-Probleme
- [ ] `npm run build` erfolgreich (TypeScript + ESLint)
- [ ] Versionsnummern aktualisiert bei Releases
