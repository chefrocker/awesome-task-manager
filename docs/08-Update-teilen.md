**Note:** Due to model limitations, the response may not account for all data in the uploaded file(s). For better results, consider using fewer or smaller file(s) with essential excerpts. [Learn more](https://you.com/support/what-are-the-context-window-limits)


Hier ist die **ultra-detaillierte Anleitung** für den kompletten Versions-Update-Prozess. Ich habe deine originale Dokumentation gelesen und schreibe dir alles so ausführlich wie möglich.

---

# 🔄 Komplette Anleitung: Neue Version veröffentlichen

## Awesome Task Manager – Obsidian Plugin

---

## 📋 Übersicht: Was passiert bei einem Version-Update?

Bei jeder neuen Version machst du **immer** diese 8 Schritte:

```
1. Code ändern (Bugfix, neues Feature, etc.)
2. Versionsnummer an 3 Stellen erhöhen
3. Changelog/Dokumentation im docs-Ordner aktualisieren
4. Projekt neu bauen (npm run build)
5. Lokal in Obsidian testen
6. Alles zu GitHub pushen
7. GitHub Release erstellen
8. Obsidian-Nutzer bekommen das Update automatisch
```

---

## 📖 Schritt 0: Versionsnummern verstehen

Bevor du loslegst, musst du wissen welche Art von Update du machst:

### Semantic Versioning: MAJOR.MINOR.PATCH

```
Beispiel: 1.2.3
           │ │ │
           │ │ └── PATCH = 3 (Bugfixes, kleine Korrekturen)
           │ └──── MINOR = 2 (Neue Features, Verbesserungen)
           └────── MAJOR = 1 (Große Umbauten, Breaking Changes)
```

### Wann erhöhe ich was?

| Was hast du gemacht? | Welche Nummer? | Beispiel |
|---------------------|----------------|----------|
| Einen Bug gefixt | PATCH +1 | `1.0.0` → `1.0.1` |
| Kleinen Text geändert | PATCH +1 | `1.0.1` → `1.0.2` |
| CSS-Styling angepasst | PATCH +1 | `1.0.2` → `1.0.3` |
| Neues Feature hinzugefügt | MINOR +1, PATCH = 0 | `1.0.3` → `1.1.0` |
| Mehrere Features hinzugefügt | MINOR +1, PATCH = 0 | `1.1.0` → `1.2.0` |
| Kompletter Umbau des Plugins | MAJOR +1, Rest = 0 | `1.2.0` → `2.0.0` |

**Für dieses Beispiel nehmen wir an:** Du gehst von `1.0.0` auf `1.1.0` (neues Feature).

---

## 🔧 Schritt 1: CMD öffnen und Repo aktualisieren

Öffne ein **neues CMD-Fenster** (Start → `cmd` → Enter):

```cmd
cd "C:\Code\Awesome Task Manager"
```

**Zuerst sicherstellen, dass du die neueste Version hast:**

```cmd
git pull origin main
```

Mögliche Ausgaben:

✅ **Gut:**
```
Already up to date.
```

✅ **Auch gut:**
```
Updating abc1234..def5678
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
```

⚠️ **Falls ein Merge-Editor aufgeht (Vim):**
```
Tippe:  :wq
Drücke: Enter
```

⚠️ **Falls Fehler "refusing to merge unrelated histories":**
```cmd
git pull origin main --allow-unrelated-histories
```

---

## 🔧 Schritt 2: Code-Änderungen machen

Öffne Visual Studio Code:

```cmd
code .
```

Mache jetzt deine Änderungen an den Dateien in `src/`. Zum Beispiel:
- Bug in `src/core/TaskManager.ts` gefixt
- Neues Feature in `src/ui/DashboardView.ts` hinzugefügt
- Styling in `styles.css` angepasst
- etc.

**Speichere alle Dateien** mit `Strg+S`.

---

## 🔧 Schritt 3: Versionsnummer an 3 Stellen erhöhen

### Stelle 1: `manifest.json`

Öffne `C:\Code\Awesome Task Manager\manifest.json` in VS Code.

**Vorher:**
```json
{
    "id": "awesome-task-manager",
    "name": "Awesome Task Manager",
    "version": "1.0.0",
    "minAppVersion": "1.0.0",
    "description": "A full-featured visual task manager with dashboard, inline editing, tags, images, recurring tasks, reminders, and Excel export.",
    "author": "Sandro Ballarini",
    "authorUrl": "https://github.com/chefrocker",
    "fundingUrl": "",
    "isDesktopOnly": false
}
```

**Nachher (nur die version-Zeile ändern):**
```json
{
    "id": "awesome-task-manager",
    "name": "Awesome Task Manager",
    "version": "1.1.0",
    "minAppVersion": "1.0.0",
    "description": "A full-featured visual task manager with dashboard, inline editing, tags, images, recurring tasks, reminders, and Excel export.",
    "author": "Sandro Ballarini",
    "authorUrl": "https://github.com/chefrocker",
    "fundingUrl": "",
    "isDesktopOnly": false
}
```

> ⚠️ **Nur `version` ändern!** `minAppVersion` bleibt bei `1.0.0` (es sei denn, du brauchst eine neuere Obsidian-Version).

Speichern: `Strg+S`

---

### Stelle 2: `package.json`

Öffne `C:\Code\Awesome Task Manager\package.json` in VS Code.

**Vorher:**
```json
{
    "name": "awesome-task-manager",
    "version": "1.0.0",
```

**Nachher:**
```json
{
    "name": "awesome-task-manager",
    "version": "1.1.0",
```

Speichern: `Strg+S`

---

### Stelle 3: `versions.json`

Öffne `C:\Code\Awesome Task Manager\versions.json` in VS Code.

**Vorher:**
```json
{
    "1.0.0": "1.0.0"
}
```

**Nachher (neue Zeile HINZUFÜGEN, alte NICHT löschen):**
```json
{
    "1.0.0": "1.0.0",
    "1.1.0": "1.0.0"
}
```

> 💡 **Erklärung:** `"1.1.0": "1.0.0"` bedeutet: Plugin-Version `1.1.0` braucht mindestens Obsidian-Version `1.0.0`.

> ⚠️ **Vergiss das Komma nicht** nach der vorherigen Zeile!

Speichern: `Strg+S`

---

## 🔧 Schritt 4: Changelog im `docs`-Ordner anlegen/aktualisieren

### Erstelle den `docs`-Ordner (falls noch nicht vorhanden):

```cmd
mkdir docs
```

(Falls er schon existiert, ist das kein Problem.)

### Erstelle/Aktualisiere die Datei `docs/CHANGELOG.md`

Öffne VS Code und erstelle die Datei `docs/CHANGELOG.md`:

**Bei der allerersten Version (1.0.0 → 1.1.0) sieht die Datei so aus:**

```markdown
# Changelog – Awesome Task Manager

Alle Änderungen an diesem Plugin werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/)
und das Projekt verwendet [Semantic Versioning](https://semver.org/lang/de/).

---

## [1.1.0] – 2026-03-23

### Hinzugefügt
- Hier beschreibst du neue Features
- Beispiel: Neuer Dark-Mode für das Dashboard
- Beispiel: Drag & Drop Sortierung in der Tabelle

### Geändert
- Hier beschreibst du Änderungen an bestehenden Features
- Beispiel: Verbessertes Layout der Filter-Leiste

### Behoben
- Hier beschreibst du Bug-Fixes
- Beispiel: Fälligkeitsdatum wurde falsch angezeigt
- Beispiel: Tags wurden nicht gespeichert

### Entfernt
- Hier beschreibst du entfernte Features (falls vorhanden)

---

## [1.0.0] – 2026-03-23

### Erstveröffentlichung
- Dashboard mit 4 Tabs (Heute/Woche/Offen/Alle)
- Inline-Editing für Priorität, Status und Fortschritt
- Tag-System mit Autocomplete
- Bild-Anhänge hochladen und verwalten
- Wiederkehrende Aufgaben (Täglich/Wöchentlich/Monatlich/Jährlich)
- Erinnerungen mit Obsidian-Benachrichtigungen
- Excel-Export in Zwischenablage
- Mehrsprachig (Deutsch & Englisch)
- Tägliche Zusammenfassung beim Start
- Aufgaben als Markdown mit YAML-Frontmatter gespeichert
- Einstellungsseite mit Ordner, Sprache, Priorität, Tab-Konfiguration
```

Speichern: `Strg+S`

---

### Optional: Weitere Dokumentation im `docs`-Ordner

Du kannst auch weitere Dateien anlegen:

```
docs/
├── CHANGELOG.md              ← Änderungsprotokoll (Pflicht für dich)
├── plugin-documentation.md   ← Deine technische Dokumentation
├── user-guide-de.md          ← Benutzerhandbuch Deutsch
├── user-guide-en.md          ← Benutzerhandbuch Englisch
└── developer-notes.md        ← Entwickler-Notizen
```

Für jetzt reicht **`CHANGELOG.md`** völlig aus.

---

## 🔧 Schritt 5: Projekt neu bauen

Zurück im CMD:

```cmd
cd "C:\Code\Awesome Task Manager"
npm run build
```

**Erwartete Ausgabe bei Erfolg:**

```
> awesome-task-manager@1.1.0 build
> tsc -noEmit -skipLibCheck && node esbuild.config.mjs production

  main.js  XXX.XkB

⚡ Done in XXms
```

> ✅ **Keine Fehler?** → Weiter zu Schritt 6!
>
> ❌ **Fehler?** → Lies die Fehlermeldung, fixe den Code, und führe `npm run build` nochmal aus.

---

## 🔧 Schritt 6: Lokal in Obsidian testen

Bevor du etwas auf GitHub pushst, **teste lokal**!

### Dateien kopieren:

```cmd
set VAULT=C:\PFAD\ZU\DEINEM\OBSIDIAN\VAULT

copy /Y "C:\Code\Awesome Task Manager\main.js" "%VAULT%\.obsidian\plugins\awesome-task-manager\main.js"
copy /Y "C:\Code\Awesome Task Manager\manifest.json" "%VAULT%\.obsidian\plugins\awesome-task-manager\manifest.json"
copy /Y "C:\Code\Awesome Task Manager\styles.css" "%VAULT%\.obsidian\plugins\awesome-task-manager\styles.css"
```

> ⚠️ **Ersetze** `C:\PFAD\ZU\DEINEM\OBSIDIAN\VAULT` mit dem echten Pfad zu deinem Vault!
>
> **Beispiel:** `C:\Users\Sandro\MeinVault`

### Obsidian neu starten:

1. Schließe Obsidian komplett (auch aus dem System Tray!)
2. Öffne Obsidian wieder
3. Teste dein Plugin gründlich:
   - Öffne das Dashboard (✅-Icon)
   - Erstelle eine neue Aufgabe
   - Ändere Status, Priorität, Fortschritt
   - Teste Filter und Suche
   - Teste das neue Feature das du hinzugefügt hast

### Alles funktioniert? → Weiter!

### Etwas ist kaputt? → Zurück zu Schritt 2, fixen, nochmal bauen und testen.

---

## 🔧 Schritt 7: Alles zu GitHub pushen

### 7a: Prüfen was sich geändert hat

```cmd
cd "C:\Code\Awesome Task Manager"
git status
```

**Erwartete Ausgabe:**

```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to include in what will be committed)
        modified:   manifest.json
        modified:   package.json
        modified:   versions.json
        modified:   src/core/TaskManager.ts
        modified:   styles.css

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        docs/
```

Das zeigt dir alle Dateien die geändert oder neu sind.

---

### 7b: Alle Änderungen zum Commit vormerken

```cmd
git add .
```

> 💡 **`git add .`** fügt ALLES hinzu was geändert oder neu ist. Das ist meistens das was du willst.
>
> Falls du **nur bestimmte Dateien** hinzufügen willst:
> ```cmd
> git add manifest.json
> git add package.json
> git add versions.json
> git add docs/CHANGELOG.md
> git add src/core/TaskManager.ts
> ```

---

### 7c: Nochmal prüfen (optional aber empfohlen)

```cmd
git status
```

**Alles sollte jetzt GRÜN sein:**

```
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   manifest.json
        modified:   package.json
        modified:   versions.json
        modified:   src/core/TaskManager.ts
        modified:   styles.css
        new file:   docs/CHANGELOG.md
```

---

### 7d: Commit erstellen

```cmd
git commit -m "Release 1.1.0: Beschreibung der Änderungen"
```

**Beispiele für gute Commit-Nachrichten:**

```cmd
git commit -m "Release 1.1.0: Add dark mode dashboard, fix date display bug"
git commit -m "Release 1.0.1: Fix tag autocomplete not saving"
git commit -m "Release 2.0.0: Complete UI redesign with new card layout"
```

**Erwartete Ausgabe:**

```
[main abc1234] Release 1.1.0: Add dark mode dashboard, fix date display bug
 6 files changed, 150 insertions(+), 23 deletions(-)
 create mode 100644 docs/CHANGELOG.md
```

---

### 7e: Zu GitHub hochladen

```cmd
git push origin main
```

**Falls nach Anmeldedaten gefragt wird:**
- **Benutzername:** `chefrocker`
- **Passwort:** Dein **Personal Access Token** (NICHT dein GitHub-Passwort!)

> 💡 **Token erstellen/finden:** https://github.com/settings/tokens

**Erwartete Ausgabe:**

```
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.
Writing objects: 100% (7/7), 2.34 KiB | 2.34 MiB/s, done.
Total 7 (delta 3), reused 0 (delta 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To https://github.com/chefrocker/awesome-task-manager.git
   abc1234..def5678  main -> main
```

✅ **Dein Code ist jetzt auf GitHub!**

---

## 🔧 Schritt 8: GitHub Release erstellen

Das ist der **wichtigste Schritt** – nur so erkennt Obsidian das Update!

### 8a: Release-Seite öffnen

Gehe zu: **https://github.com/chefrocker/awesome-task-manager/releases/new**

---

### 8b: Tag erstellen

1. Klicke auf **"Choose a tag"**
2. Tippe in das Feld: `1.1.0`
3. Es erscheint: **"Create new tag: 1.1.0 on publish"**
4. Klicke darauf

> ⚠️ **KEIN `v` davor!** Richtig: `1.1.0` | Falsch: `v1.1.0`

---

### 8c: Release-Titel eingeben

```
1.1.0
```

> ⚠️ **Auch hier KEIN `v` davor!** Der Titel muss **exakt** die Versionsnummer sein.

---

### 8d: Release-Beschreibung eingeben

Kopiere den passenden Abschnitt aus deiner `docs/CHANGELOG.md`:

```markdown
## Changes in 1.1.0

### New Features
- Neuer Dark-Mode für das Dashboard
- Drag & Drop Sortierung in der Tabelle

### Bug Fixes
- Fälligkeitsdatum wurde falsch angezeigt
- Tags wurden nicht gespeichert

### Improvements
- Verbessertes Layout der Filter-Leiste

---

**Full Changelog:** https://github.com/chefrocker/awesome-task-manager/blob/main/docs/CHANGELOG.md
```

---

### 8e: Dateien anhängen (KRITISCH!)

Scrolle nach unten zum Bereich **"Attach binaries by dropping them here or selecting them"**.

**Du musst 3 Dateien anhängen:**

1. Klicke auf den Bereich oder ziehe die Dateien per Drag & Drop
2. Navigiere zu `C:\Code\Awesome Task Manager\`
3. Wähle:
   - ✅ `main.js`
   - ✅ `manifest.json`
   - ✅ `styles.css`

> ⚠️ **GANZ WICHTIG:**
> - Die Dateien müssen als **einzelne Dateien** angehängt sein
> - Sie dürfen **NICHT** nur im automatischen `Source code (zip)` stecken
> - Obsidian sucht nach diesen **einzelnen Dateien** im Release

**Nach dem Hochladen solltest du sehen:**

```
Assets:
  main.js        xxx KB
  manifest.json  xxx B
  styles.css     xxx KB
  Source code (zip)    ← automatisch, ignorieren
  Source code (tar.gz) ← automatisch, ignorieren
```

---

### 8f: Release-Einstellungen

- ✅ **"Set as the latest release"** – muss aktiviert sein!
- ❌ **"Set as a pre-release"** – NICHT aktivieren (es sei denn es ist eine Beta)

---

### 8g: Veröffentlichen

Klicke auf den grünen Button: **"Publish release"** 🎉

---

## ✅ Fertig! Was passiert jetzt automatisch?

1. **Obsidian** prüft regelmäßig die GitHub Releases deines Plugins
2. Wenn ein Nutzer dein Plugin installiert hat, sieht er in Obsidian unter **Einstellungen → Community Plugins** einen **"Update"**-Button
3. Der Nutzer klickt auf Update → Obsidian lädt `main.js`, `manifest.json` und `styles.css` vom neuesten Release herunter
4. **Du musst KEINEN neuen PR** auf `obsidian-releases` erstellen – das war nur einmalig für die Erstveröffentlichung!

---

## 📋 Schnellreferenz: Alle Befehle auf einen Blick

```cmd
REM ========================================
REM NEUE VERSION VERÖFFENTLICHEN
REM ========================================

REM 1. In den Projektordner wechseln
cd "C:\Code\Awesome Task Manager"

REM 2. Neueste Version von GitHub holen
git pull origin main

REM 3. VS Code öffnen und Änderungen machen
code .

REM 4. NACH den Code-Änderungen:
REM    - manifest.json  → version erhöhen
REM    - package.json   → version erhöhen
REM    - versions.json  → neue Zeile hinzufügen
REM    - docs/CHANGELOG.md → Änderungen dokumentieren

REM 5. Neu bauen
npm run build

REM 6. Lokal testen (Dateien kopieren)
set VAULT=C:\PFAD\ZUM\VAULT
copy /Y main.js "%VAULT%\.obsidian\plugins\awesome-task-manager\"
copy /Y manifest.json "%VAULT%\.obsidian\plugins\awesome-task-manager\"
copy /Y styles.css "%VAULT%\.obsidian\plugins\awesome-task-manager\"

REM 7. Zu GitHub pushen
git add .
git commit -m "Release X.X.X: Beschreibung"
git push origin main

REM 8. Dann auf GitHub:
REM    → https://github.com/chefrocker/awesome-task-manager/releases/new
REM    → Tag: X.X.X (kein v!)
REM    → Title: X.X.X
REM    → 3 Dateien anhängen: main.js, manifest.json, styles.css
REM    → Publish release!
```

---

## ⚠️ Häufige Fehler und Lösungen

| Problem | Lösung |
|---------|--------|
| `npm run build` zeigt Fehler | Lies die Fehlermeldung, fixe den TypeScript-Code |
| `git push` fragt nach Passwort | Benutze deinen Personal Access Token, NICHT dein GitHub-Passwort |
| `git push` wird abgelehnt | Erst `git pull origin main` ausführen, dann nochmal pushen |
| Release-Bot beschwert sich | Prüfe ob alle 3 Dateien als einzelne Assets angehängt sind |
| Version stimmt nicht überein | `manifest.json`, `package.json` und `versions.json` müssen die gleiche Version haben |
| Obsidian zeigt kein Update | Release-Tag muss **exakt** die Versionsnummer sein (kein `v`!) |
| Plugin erscheint nicht | Prüfe ob `manifest.json` im Release **und** im Repo die gleiche Version hat |

---

## 📁 Dein docs-Ordner nach mehreren Updates

Nach ein paar Versionen sieht dein `docs/CHANGELOG.md` so aus:

```markdown
# Changelog – Awesome Task Manager

---

## [1.2.0] – 2026-04-15

### Hinzugefügt
- Neue Kalender-Ansicht
- Export als PDF

### Behoben
- Crash beim Löschen von Tasks mit Bildern

---

## [1.1.0] – 2026-03-30

### Hinzugefügt
- Dark-Mode Dashboard
- Drag & Drop Sortierung

### Behoben
- Fälligkeitsdatum falsch angezeigt

---

## [1.0.0] – 2026-03-23

### Erstveröffentlichung
- Alle initialen Features
```

Und deine `versions.json`:

```json
{
    "1.0.0": "1.0.0",
    "1.1.0": "1.0.0",
    "1.2.0": "1.0.0"
}
```

---

Sag mir Bescheid wenn du Fragen hast! 🚀
