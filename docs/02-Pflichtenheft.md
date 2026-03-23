# Pflichtenheft – Awesome Task Manager

**Projekt:** Awesome Task Manager – Obsidian Plugin
**Auftragnehmer:** [Entwicklerteam]
**Auftraggeber:** Sandro Ballarini
**Version:** 1.0
**Datum:** 23.03.2026
**Status:** Entwurf

---

## 1. Zielbestimmung

### 1.1 Musskriterien

Das Plugin MUSS folgende Funktionen bereitstellen:

**Dashboard:**
- Custom View ohne sichtbaren Quelltext
- 4 Tabs: Heute/Überfällig, Diese Woche, Alle offenen, Alle Aufgaben
- Filterleiste mit Tag-, Priorität-, Bezeichnung-Filter und Freitextsuche
- Alle Filter kombinierbar

**Aufgabenverwaltung:**
- Aufgaben erstellen über Button/Command mit Modal
- 14 Felder pro Aufgabe (siehe Datenmodell Kapitel 3)
- Inline-Editing für Status, Priorität, %, Tags in der Tabelle
- Detail-Ansicht für vollständige Bearbeitung
- 3 Status-Werte: Offen, in Bearbeitung, Abgeschlossen
- 4 Prioritätsstufen: Höchste, Hoch, Normal, Niedrig

**Automatische Logiken:**
- Logik A: Status Abgeschlossen → 100%
- Logik B: 100% → Status Abgeschlossen + Abschlussdatum heute
- Logik C: Offen + % > 0 → in Bearbeitung
- Logik D: % < 100 → in Bearbeitung + Abschlussdatum leeren
- Logik E: Farbcodierung (rot/gelb/grün)
- Logik F: Überfällig-Warnung

**Tags:**
- Mehrere Tags pro Aufgabe
- Autocomplete aus bestehenden Tags
- Lernende Tag-Liste (neue Tags werden gespeichert)
- Tag-Verwaltung in Einstellungen

**Bilder:**
- Upload pro Aufgabe
- Automatischer Datumsstempel im Dateinamen
- Umbenennung mit Erledigt-Präfix bei Abschluss

**Wiederkehrende Aufgaben:**
- Intervalle: Täglich, Wöchentlich, Monatlich, Jährlich, Benutzerdefiniert
- Automatische Neuerstellung bei Abschluss
- Visuelle Markierung mit Symbol

**Erinnerungen:**
- Desktop-Benachrichtigungen
- Konfigurierbare Erinnerungszeit pro Aufgabe
- Optionale tägliche Zusammenfassung

**Excel-Export:**
- Ein-Klick-Button
- Exakte Spaltenstruktur (11 Spalten)
- Excel-Formel in ERLEDIGT-Spalte
- Mehrzeilige Notizen in einer Zelle

**Einstellungen:**
- Aufgaben-Ordner Pfad
- Bilder-Ordner Pfad
- Sprache (DE/EN)
- Standard-Priorität
- Standard-Tab
- Datumsformat
- Tag-Verwaltung

**Technisch:**
- Desktop + Mobile kompatibel
- Keine externen Plugin-Abhängigkeiten
- Mehrsprachig (i18n)
- Open Source (MIT License)

### 1.2 Wunschkriterien

- Drag-and-Drop Sortierung von Aufgaben
- Keyboard-Shortcuts für häufige Aktionen
- Dunkelmodus-Optimierung
- Batch-Bearbeitung (mehrere Aufgaben gleichzeitig)

### 1.3 Abgrenzungskriterien

Das Plugin wird NICHT:
- Einen eigenen Sync-Service bereitstellen (nutzt Obsidian Sync/Drittanbieter)
- Kalenderansicht bieten (kann später ergänzt werden)
- Projektmanagement-Features wie Gantt-Charts enthalten
- Kollaboration/Mehrbenutzer unterstützen

---

## 2. Einsatz

### 2.1 Anwendungsbereiche
- Persönliche Aufgabenverwaltung
- Projektbezogene Aufgabenlisten
- Reporting via Excel-Export

### 2.2 Zielgruppen
- Obsidian-Nutzer die ein visuelles Task-Management suchen
- Präkrastinisten (sofort erfassen und erledigen)
- Nutzer die Aufgabenlisten nach Excel exportieren müssen

### 2.3 Betriebsbedingungen
- Obsidian Desktop: Windows, macOS, Linux
- Obsidian Mobile: iOS, Android
- Obsidian Version: >= 1.0.0
- Keine Internetverbindung erforderlich

---

## 3. Datenmodell

### 3.1 Aufgabe (Task)

```yaml
aufgabe: string           # Pflicht - Titel der Aufgabe
bezeichnung: string       # Optional - Kategorie/Projekt
prioritaet: enum          # Pflicht - Höchste|Hoch|Normal|Niedrig
prioritaet_nr: number     # Automatisch - 1|2|3|4
status: enum              # Automatisch - Offen|in Bearbeitung|Abgeschlossen
anfangsdatum: date        # Automatisch - Erstelldatum
faelligkeitsdatum: date   # Optional - Deadline
abschlussdatum: date      # Automatisch - bei 100%
prozent: number           # Pflicht - 0 bis 100
erledigt: boolean         # Berechnet - true wenn prozent = 100
tags: string[]            # Optional - Liste von Tags
link: string              # Optional - Externe URL
bilder: string[]          # Optional - Liste von Bildpfaden
wiederkehrend: object     # Optional - Intervall-Konfiguration
erinnerung: object        # Optional - Erinnerungs-Konfiguration
notizen: string           # Optional - Mehrzeiliger Text
3.2 Tag-Speicher
json


{
  "tags": ["Jens", "GLC", "Eliona", "Infrastruktur", "Timo"]
}
3.3 Plugin-Einstellungen
json


{
  "taskFolder": "Aufgaben",
  "imageFolder": "Anhaenge",
  "language": "de",
  "defaultPriority": "Normal",
  "defaultTab": "today",
  "dateFormat": "dd.MM.yyyy",
  "dailySummary": true,
  "defaultReminderTime": "same-day"
}
4. Funktionsbeschreibungen
4.1 Dashboard öffnen
Ablauf:
Nutzer klickt auf das Plugin-Icon in der Sidebar ODER nutzt Command
Dashboard öffnet sich als Custom View
Standard-Tab wird angezeigt (konfigurierbar)
Filterleiste ist sichtbar
Aufgaben werden aus dem konfigurierten Ordner geladen
Tabelle wird gerendert
4.2 Aufgabe erstellen
Ablauf:
Nutzer klickt auf Plus-Button im Dashboard ODER nutzt Command
Modal öffnet sich mit Eingabefeldern
Pflichtfelder: Aufgabe (Titel)
Optionale Felder vorausgefüllt mit Defaults
Bei Bestätigung wird .md-Datei im Aufgaben-Ordner erstellt
Dashboard aktualisiert sich automatisch
4.3 Aufgabe inline bearbeiten
Ablauf:
Nutzer klickt auf ein Inline-Feld in der Tabelle
Feld wird editierbar (Dropdown/Slider/Input)
Bei Änderung werden automatische Logiken ausgeführt
.md-Datei wird aktualisiert
Tabelle aktualisiert sich
4.4 Aufgabe in Detail-Ansicht bearbeiten
Ablauf:
Nutzer klickt auf Aufgabentitel in der Tabelle
Detail-Ansicht öffnet sich (ersetzt Dashboard)
Alle Felder sind editierbar
Bilder können hochgeladen werden
Zurück-Button führt zum Dashboard
Änderungen werden sofort in .md-Datei gespeichert
4.5 Excel-Export
Ablauf:
Nutzer klickt Export-Button im aktuellen Tab
Alle sichtbaren Aufgaben (nach Filter) werden exportiert
Daten werden als Tab-separierter Text in Zwischenablage kopiert
Spaltenreihenfolge: AUFGABE, Bezeichnung, PRIORITÄT, STATUS, ANFANGSDATUM, FÄLLIGKEITSDATUM, ABSCHLUSSDATUM, % ABGESCHLOSSEN, ERLEDIGT?, NOTIZEN, Link
ERLEDIGT-Spalte enthält Formel: =--([@[% ABGESCHLOSSEN]]>=1)
Mehrzeilige Notizen in Anführungszeichen
Nutzer fügt in Excel ein mit Strg+V
4.6 Wiederkehrende Aufgabe abschliessen
Ablauf:
Nutzer setzt wiederkehrende Aufgabe auf 100%
Logik B wird ausgeführt (Status Abgeschlossen + Datum)
RecurrenceEngine erkennt wiederkehrende Regel
Neue Aufgabe wird erstellt mit:
Gleiche Felder wie Original
% = 0, Status = Offen
Neues Fälligkeitsdatum gemäss Intervall
Neues Anfangsdatum = heute
Originalaufgabe bleibt als abgeschlossen bestehen
4.7 Erinnerung auslösen
Ablauf:
ReminderEngine prüft regelmässig fällige Erinnerungen
Bei Fälligkeit wird Obsidian Notice angezeigt
Notice enthält Aufgabentitel und Fälligkeitsdatum
Klick auf Notice öffnet die Aufgabe im Dashboard
4.8 Tägliche Zusammenfassung
Ablauf:
Nutzer öffnet Obsidian
Plugin prüft ob Zusammenfassung heute schon angezeigt wurde
Falls nicht: Modal mit Übersicht aller heute fälligen Tasks
Überfällige Tasks werden hervorgehoben
5. Benutzeroberfläche
5.1 Dashboard Layout


+----------------------------------------------------------+
| [+Neu]  [Export]                          [Suche___] |
+----------------------------------------------------------+
| [Heute] [Woche] [Offen] [Alle] |
+----------------------------------------------------------+
| Tag: [Dropdown] Priorität: [Dropdown] Bez: [Dropdown] |
+----------------------------------------------------------+
| AUFGABE | BEZEICHNUNG | PRIO | STATUS | FÄLLIG | % |
| -------- | ------------- | ------ | -------- | -------- | ----- |
| Task 1 | Projekt A | Hoch | Offen | 25.03 | 50% |
| Task 2 | Projekt B | Norm | Bearb. | 28.03 | 25% |
+----------------------------------------------------------+
5.2 Detail-Ansicht Layout


+----------------------------------------------------------+
| [< Zurück]                          [Löschen] |
+----------------------------------------------------------+
| Aufgabe:        [________________________] |
| Bezeichnung:    [________________________] |
| Priorität:      [Dropdown___] |
| Status:         [Dropdown___] |
| Anfangsdatum:   [Datepicker] |
| Fälligkeitsdat: [Datepicker] |
| Abschlussdatum: [Automatisch] |
| % Abgeschlossen:[Slider 0----100] |
| Tags:           [Tag1] [Tag2] [+___] |
| Link:           [https://___] |
| Wiederkehrend:  [Dropdown: Keine/Tägl/Wöch/Mon/...] |
| Erinnerung:     [Dropdown: Keine/1Tag/Gleichtag/...] |
| Bilder:         [Upload] [Bild1] [Bild2] |
| Notizen: |
| [                                                    ] |
| [                                                    ] |
| [                                                    ] |
+----------------------------------------------------------+
5.3 Farbcodierung
Zustand	Farbe
% = 0	Rot (#e74c3c)
% = 1-24	Orange (#e67e22)
% = 25-75	Gelb (#f1c40f)
% = 76-99	Hellgrün (#2ecc71)
% = 100	Grün (#27ae60)
Überfällig (Datum < heute, % < 100)	Roter Rahmen + ⚠️

Export as CSV
6. Technische Umsetzung
6.1 Technologie
Komponente	Technologie
Sprache	TypeScript
API	Obsidian Plugin API
UI-Rendering	HTML/CSS via Obsidian Custom View
Build	esbuild
Datenspeicherung	Markdown-Dateien + JSON

Export as CSV
6.2 Modulstruktur
Siehe Architektur-Dokument (03-Architektur.md)
6.3 Dateiformat einer Aufgabe
Jede Aufgabe wird als .md-Datei mit YAML-Frontmatter gespeichert:
yaml


---
aufgabe: "Aufgabentitel"
bezeichnung: "Kategorie"
prioritaet: "Normal"
prioritaet_nr: 3
status: "Offen"
anfangsdatum: 2026-03-23
faelligkeitsdatum: 2026-03-28
abschlussdatum:
prozent: 0
erledigt: false
tags:
  - Tag1
  - Tag2
link: ""
bilder: []
wiederkehrend:
  aktiv: false
  intervall: null
  wert: null
erinnerung:
  aktiv: false
  zeit: null
notizen: ""
---
Notizen
Freitext Notizen hier



---

## 7. Qualitätsanforderungen

| Kriterium       | Anforderung                               |
| --------------- | ----------------------------------------- |
| Performance     | Flüssig mit 500+ Aufgaben                |
| Zuverlässigkeit | Keine Datenverluste bei Speicherung       |
| Wartbarkeit     | Modularer Code, dokumentiert              |
| Portabilität    | Desktop + Mobile identische Funktion      |
| Benutzbarkeit   | Maximal 2 Klicks für häufige Aktionen     |

---

## 8. Entwicklungsphasen

| Phase | Inhalt                                  | Meilenstein         |
| ----- | --------------------------------------- | ------------------- |
| 1     | Core: TaskManager, Datenmodell, Storage | .md Dateien CRUD    |
| 2     | UI: Dashboard, Tabelle, Tabs           | Dashboard sichtbar  |
| 3     | UI: Detail-Ansicht, Modal, Inline-Edit | Aufgaben bearbeitbar|
| 4     | Filter, Sortierung, Freitextsuche      | Filter funktional   |
| 5     | Tags, Autocomplete, Tag-Verwaltung     | Tags nutzbar        |
| 6     | Excel-Export mit Formel                | Export funktional   |
| 7     | Bilder, Datumsstempel, Umbenennung     | Bilder funktional   |
| 8     | Logiken A-F                            | Automatismen aktiv  |
| 9     | Wiederkehrende Aufgaben                | Recurrence aktiv    |
| 10    | Erinnerungen, Zusammenfassung          | Reminders aktiv     |
| 11    | Einstellungen, i18n                    | Settings komplett   |
| 12    | Mobile-Optimierung, Tests              | Mobile ready        |
| 13    | Dokumentation, README                  | Publish ready       |
| 14    | Obsidian Community Store Einreichung   | Veröffentlicht      |