# Testkonzept – Awesome Task Manager

**Projekt:** Awesome Task Manager – Obsidian Plugin
**Autor:** Sandro Ballarini
**Version:** 1.0
**Datum:** 23.03.2026

---

## 1. Teststrategie

### 1.1 Testebenen

| Ebene              | Werkzeug       | Verantwortung                        |
| ------------------ | -------------- | ------------------------------------ |
| Unit Tests         | Jest/Vitest    | Core Layer (Logiken, Datenmodell)    |
| Integrationstests  | Jest/Vitest    | Storage + Core zusammen              |
| Manuelle Tests     | Obsidian App   | UI, Mobile, Export                   |
| Abnahmetests       | Obsidian App   | Alle Anforderungen aus Lastenheft    |

---

## 2. Unit Tests

### 2.1 TaskManager

| Test-ID | Beschreibung                                         | Erwartetes Ergebnis                 |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| TM-001  | Aufgabe erstellen mit Pflichtfeldern                 | Task wird erstellt, Status=Offen    |
| TM-002  | Aufgabe erstellen ohne Titel                         | Fehler wird geworfen                |
| TM-003  | Logik A: Status auf Abgeschlossen setzen             | % wird 100, Datum wird heute        |
| TM-004  | Logik B: % auf 100 setzen                            | Status wird Abgeschlossen           |
| TM-005  | Logik C: % auf 50 setzen bei Status Offen            | Status wird in Bearbeitung          |
| TM-006  | Logik D: % von 100 auf 50 senken                     | Status in Bearbeitung, Datum leer   |
| TM-007  | Filter nach Tag                                      | Nur Tasks mit Tag werden geliefert  |
| TM-008  | Filter nach Priorität                                | Nur Tasks mit Prio werden geliefert |
| TM-009  | Filter Freitextsuche                                 | Alle Felder werden durchsucht       |
| TM-010  | Kombinierte Filter                                   | AND-Verknüpfung aller Filter        |
| TM-011  | getTodayAndOverdue bei überfälligem Task             | Task erscheint in Liste             |
| TM-012  | getThisWeek berechnet KW korrekt                     | Montag bis Sonntag der aktuellen KW |

### 2.2 TagStore

| Test-ID | Beschreibung                                         | Erwartetes Ergebnis                 |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| TS-001  | Neuen Tag hinzufügen                                 | Tag in Liste vorhanden              |
| TS-002  | Duplikat-Tag hinzufügen                              | Kein Duplikat in Liste              |
| TS-003  | Tag umbenennen                                       | Alter Name weg, neuer da            |
| TS-004  | Tag löschen                                          | Tag nicht mehr in Liste             |
| TS-005  | Autocomplete Vorschläge                              | Gefilterte Liste nach Eingabe       |

### 2.3 RecurrenceEngine

| Test-ID | Beschreibung                                         | Erwartetes Ergebnis                 |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| RE-001  | Tägliche Wiederholung                                | Nächster Tag als Fälligkeitsdatum   |
| RE-002  | Wöchentliche Wiederholung (Montag)                   | Nächster Montag                     |
| RE-003  | Monatliche Wiederholung (am 15.)                     | 15. des Folgemonats                 |
| RE-004  | Jährliche Wiederholung                               | Gleiches Datum nächstes Jahr        |
| RE-005  | Benutzerdefiniert alle 3 Tage                        | +3 Tage                            |
| RE-006  | Neue Aufgabe hat % = 0 und Status Offen              | Korrekte Felder in Kopie            |

### 2.4 ReminderEngine

| Test-ID | Beschreibung                                         | Erwartetes Ergebnis                 |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| RM-001  | Erinnerung am gleichen Tag                           | Notification wird ausgelöst         |
| RM-002  | Erinnerung 1 Tag vorher                              | Notification am Vortag              |
| RM-003  | Keine Erinnerung für erledigte Tasks                 | Keine Notification                  |

### 2.5 ExportButton

| Test-ID | Beschreibung                                         | Erwartetes Ergebnis                 |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| EX-001  | Export-Format korrekte Spaltenreihenfolge             | 11 Spalten in richtiger Reihenfolge |
| EX-002  | ERLEDIGT-Spalte enthält Excel-Formel                 | Formeltext korrekt                  |
| EX-003  | Mehrzeilige Notizen in Anführungszeichen             | Notizen in einer Zelle              |
| EX-004  | Datumsformat gemäss Einstellungen                    | Korrektes Format                    |
| EX-005  | Leere Felder werden als leer exportiert              | Kein null oder undefined            |

---

## 3. Integrationstests

| Test-ID | Beschreibung                                         | Erwartetes Ergebnis                 |
| ------- | ---------------------------------------------------- | ----------------------------------- |
| IT-001  | Task erstellen und als .md lesen                     | Frontmatter korrekt                 |
| IT-002  | Task ändern und Datei prüfen                         | Änderungen in Datei gespeichert     |
| IT-003  | Task löschen und Datei prüfen                        | Datei gelöscht                      |
| IT-004  | Bild speichern mit Datumsstempel                     | Korrekte Datei im Ordner            |
| IT-005  | Bild umbenennen bei Task-Abschluss                   | Erledigt-Präfix im Dateinamen       |
| IT-006  | Tags speichern und laden                             | JSON korrekt geschrieben/gelesen    |

---

## 4. Manuelle Tests

### 4.1 Desktop

| Test-ID | Beschreibung                                         |
| ------- | ---------------------------------------------------- |
| MD-001  | Dashboard öffnet sich als Custom View                |
| MD-002  | Alle 4 Tabs wechseln korrekt                        |
| MD-003  | Filter funktionieren einzeln und kombiniert          |
| MD-004  | Inline-Editing funktioniert für alle Schnellfelder   |
| MD-005  | Detail-Ansicht öffnet und schliesst korrekt          |
| MD-006  | Excel-Export einfügbar in Excel/LibreOffice           |
| MD-007  | Einstellungen werden gespeichert                     |
| MD-008  | Sprachwechsel ändert alle Texte                      |

### 4.2 Mobile

| Test-ID | Beschreibung                                         |
| ------- | ---------------------------------------------------- |
| MM-001  | Dashboard responsive auf kleinem Bildschirm          |
| MM-002  | Detail-Ansicht Vollbild                              |
| MM-003  | Touch-Bedienung für Dropdowns und Slider             |
| MM-004  | Bild-Upload von Kamera/Galerie                       |
| MM-005  | Benachrichtigungen auf Mobile                        |

---

## 5. Abnahmetests

Jede Anforderung aus dem Lastenheft (LA-001 bis LA-051) wird einzeln
geprüft und als bestanden/nicht bestanden dokumentiert.
