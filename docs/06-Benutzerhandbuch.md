# Benutzerhandbuch – Awesome Task Manager

**Version:** 1.0
**Autor:** Sandro Ballarini
**Datum:** 23.03.2026

---

## 1. Installation

### 1.1 Aus dem Obsidian Community Store

1. Öffne Obsidian
2. Gehe zu **Einstellungen → Community Plugins → Durchsuchen**
3. Suche nach **"Awesome Task Manager"**
4. Klicke **Installieren** und dann **Aktivieren**

### 1.2 Manuelle Installation

1. Lade die neueste Version von GitHub herunter
2. Entpacke die Dateien in:
   `[Vault]/.obsidian/plugins/awesome-task-manager/`
3. Starte Obsidian neu
4. Aktiviere das Plugin unter **Einstellungen → Community Plugins**

---

## 2. Erste Schritte

### 2.1 Einstellungen konfigurieren

1. Gehe zu **Einstellungen → Awesome Task Manager**
2. Setze den **Aufgaben-Ordner** (Standard: `Aufgaben/`)
3. Setze den **Bilder-Ordner** (Standard: `Anhaenge/`)
4. Wähle deine **Sprache**
5. Konfiguriere weitere Optionen nach Wunsch

### 2.2 Dashboard öffnen

- Klicke auf das **Aufgaben-Icon** in der linken Sidebar
- ODER nutze den Command: `Strg+P` → "Awesome Task Manager: Dashboard öffnen"

---

## 3. Aufgaben verwalten

### 3.1 Neue Aufgabe erstellen

1. Klicke auf den **[+ Neue Aufgabe]** Button im Dashboard
2. Fülle mindestens das Feld **Aufgabe** (Titel) aus
3. Setze optional: Bezeichnung, Priorität, Fälligkeitsdatum, Tags
4. Klicke **Erstellen**

### 3.2 Aufgabe schnell bearbeiten (Inline)

Direkt in der Dashboard-Tabelle kannst du folgende Felder anklicken
und sofort ändern:

- **Status** → Dropdown öffnet sich
- **Priorität** → Dropdown öffnet sich
- **% Abgeschlossen** → Slider oder Eingabefeld
- **Tags** → Autocomplete-Feld

### 3.3 Aufgabe vollständig bearbeiten (Detail-Ansicht)

1. Klicke auf den **Titel** einer Aufgabe
2. Die Detail-Ansicht öffnet sich mit allen Feldern
3. Bearbeite beliebige Felder
4. Lade Bilder hoch
5. Klicke **[← Zurück]** um zum Dashboard zurückzukehren

### 3.4 Aufgabe abschliessen

Du hast zwei Möglichkeiten:
- Setze **% Abgeschlossen** auf **100%** → Status wird automatisch
  "Abgeschlossen"
- ODER setze **Status** auf **"Abgeschlossen"** → % wird automatisch
  auf 100% gesetzt

Das **Abschlussdatum** wird automatisch auf heute gesetzt.

---

## 4. Dashboard Tabs

| Tab                       | Zeigt                                          |
| ------------------------- | ---------------------------------------------- |
| **Heute fällig**          | Alle Tasks fällig heute oder überfällig        |
| **Diese Woche**           | Alle Tasks fällig in der aktuellen KW          |
| **Alle offenen**          | Alle Tasks die noch nicht 100% sind            |
| **Alle Aufgaben**         | Alle Tasks inklusive erledigte                 |

---

## 5. Filtern und Sortieren

Die Filterleiste befindet sich über der Tabelle:

- **Tag-Filter:** Wähle einen Tag aus dem Dropdown
- **Priorität-Filter:** Wähle eine Prioritätsstufe
- **Bezeichnung-Filter:** Wähle eine Bezeichnung/Kategorie
- **Freitextsuche:** Tippe beliebigen Text → alle Felder werden durchsucht

Alle Filter können gleichzeitig verwendet werden (UND-Verknüpfung).

---

## 6. Tags

- Beim Erstellen oder Bearbeiten einer Aufgabe tippe in das Tag-Feld
- Vorhandene Tags werden als Vorschläge angezeigt
- Tippe einen neuen Namen und drücke Enter um einen neuen Tag zu erstellen
- Tags verwalten: **Einstellungen → Awesome Task Manager → Tags verwalten**

---

## 7. Bilder

- Öffne die Detail-Ansicht einer Aufgabe
- Klicke auf **[Bild hochladen]**
- Wähle ein Bild von deinem Gerät
- Das Bild erhält automatisch einen Datumsstempel im Dateinamen
- Wenn die Aufgabe abgeschlossen wird, wird der Dateiname automatisch
  mit "Erledigt-" ergänzt

---

## 8. Wiederkehrende Aufgaben

1. Öffne die Detail-Ansicht einer Aufgabe
2. Setze **Wiederkehrend** auf das gewünschte Intervall
3. Wenn du die Aufgabe abschliesst (100%), wird automatisch eine
   neue Aufgabe mit dem nächsten Fälligkeitsdatum erstellt
4. Wiederkehrende Aufgaben sind mit 🔄 markiert

---

## 9. Erinnerungen

1. Öffne die Detail-Ansicht einer Aufgabe
2. Setze **Erinnerung** auf die gewünschte Zeit
3. Du erhältst eine Benachrichtigung in Obsidian
4. Optional: Aktiviere die **Tägliche Zusammenfassung** in den Einstellungen

---

## 10. Excel-Export

1. Navigiere zum gewünschten Tab
2. Setze optional Filter
3. Klicke auf den **[Export]** Button
4. Die Tabelle wird in die Zwischenablage kopiert
5. Öffne Excel und drücke **Strg+V**
6. Die Daten werden mit korrekter Spaltenstruktur eingefügt
7. Die ERLEDIGT-Spalte enthält bereits die Excel-Formel

---

## 11. Automatische Logiken

Das Plugin arbeitet intelligent mit dir:

| Was du tust                        | Was automatisch passiert                    |
| ---------------------------------- | ------------------------------------------- |
| Status auf "Abgeschlossen"        | % wird 100%, Abschlussdatum = heute         |
| % auf 100%                        | Status wird "Abgeschlossen", Datum = heute  |
| % auf z.B. 50% (bei Status Offen) | Status wird "in Bearbeitung"                |
| % von 100% runtersetzen           | Status wird "in Bearbeitung", Datum gelöscht|

### Farbcodierung
- 🔴 Rot: 0%
- 🟠 Orange: 1-24%
- 🟡 Gelb: 25-75%
- 🟢 Hellgrün: 76-99%
- 🟢 Grün: 100%
- ⚠️ Roter Rahmen: Überfällig und nicht erledigt
