# Lastenheft – Awesome Task Manager

**Projekt:** Awesome Task Manager – Obsidian Plugin
**Auftraggeber:** Sandro Ballarini
**Version:** 1.0
**Datum:** 23.03.2026
**Status:** Freigegeben

---

## 1. Ausgangssituation

Der Auftraggeber nutzt Obsidian als persönliches Notizsystem. Die bestehenden
Lösungen für Aufgabenverwaltung in Obsidian (Tasks-Plugin, Dataview) sind
fehleranfällig beim Kopieren, erfordern Markdown-Kenntnisse und bieten keine
durchgängig visuelle Oberfläche. Insbesondere fehlt eine geschmeidige
Foto-Ablage, eine zuverlässige Synchronisation und eine Excel-kompatible
Export-Funktion.

Der Auftraggeber beschreibt sich als Präkrastinist – jemand, der Aufgaben
sofort erledigen möchte, um sie aus dem Kopf zu bekommen. Das Plugin muss
diesen Arbeitsstil optimal unterstützen.

---

## 2. Zielsetzung

Entwicklung eines eigenständigen Obsidian-Plugins, das eine vollständige
Aufgabenverwaltung mit visueller Oberfläche, automatischen Logiken,
Excel-Export und Mehrsprachigkeit bietet. Das Plugin soll ohne externe
Abhängigkeiten funktionieren und auf Desktop sowie Mobile gleichermassen
nutzbar sein.

---

## 3. Funktionale Anforderungen

### 3.1 Dashboard

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-001 | Das Plugin stellt ein visuelles Dashboard als Custom View dar  |
| LA-002 | Kein Quelltext/Markdown darf im Dashboard sichtbar sein        |
| LA-003 | Das Dashboard enthält 4 Tabs als Navigation                    |
| LA-004 | Tab 1: Heute fällig und Überfällig                             |
| LA-005 | Tab 2: Diese Woche fällig                                      |
| LA-006 | Tab 3: Alle offenen Aufgaben                                   |
| LA-007 | Tab 4: Alle Aufgaben (offen + erledigt)                        |

### 3.2 Aufgaben erstellen und bearbeiten

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-008 | Neue Aufgaben werden über einen Button/Command erstellt        |
| LA-009 | Jede Aufgabe enthält die Felder: Aufgabe, Bezeichnung,         |
|        | Priorität, Status, Anfangsdatum, Fälligkeitsdatum,            |
|        | Abschlussdatum, % Abgeschlossen, Erledigt?, Notizen, Link,    |
|        | Tags, Bilder, Wiederkehrend-Regel                              |
| LA-010 | Status-Werte: Offen, in Bearbeitung, Abgeschlossen            |
| LA-011 | Prioritäts-Werte: Höchste, Hoch, Normal, Niedrig              |
| LA-012 | Schnelle Felder (Status, Priorität, %, Tags) sind inline       |
|        | in der Tabelle editierbar                                      |
| LA-013 | Klick auf Aufgabentitel öffnet eine Detail-Ansicht             |
| LA-014 | Detail-Ansicht zeigt alle Felder, Notizen, Bilder, Link       |
| LA-015 | Zurück-Button in der Detail-Ansicht führt zum Dashboard        |

### 3.3 Filter und Sortierung

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-016 | Filter nach Tag (Dropdown)                                     |
| LA-017 | Filter nach Priorität (Dropdown)                               |
| LA-018 | Filter nach Bezeichnung (Dropdown)                             |
| LA-019 | Freitextsuche über alle Felder                                 |
| LA-020 | Alle Filter sind gleichzeitig kombinierbar                     |

### 3.4 Tags

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-021 | Mehrere Tags pro Aufgabe möglich                               |
| LA-022 | Autocomplete-Vorschläge aus bestehenden Tags                   |
| LA-023 | Neue Tags werden gespeichert und zukünftig vorgeschlagen       |
| LA-024 | Tags können in Einstellungen umbenannt/gelöscht werden         |

### 3.5 Bilder

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-025 | Bilder können pro Aufgabe hochgeladen werden                   |
| LA-026 | Dateiname erhält automatischen Datumsstempel                   |
| LA-027 | Bei Task-Abschluss wird Dateiname mit Erledigt- ergänzt        |

### 3.6 Automatische Logiken

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-028 | Status Abgeschlossen setzt automatisch 100%                   |
| LA-029 | 100% setzt Status Abgeschlossen + Abschlussdatum heute        |
| LA-030 | Status Offen + % > 0 setzt Status in Bearbeitung              |
| LA-031 | % unter 100 setzt Status in Bearbeitung + Abschlussdatum leer |
| LA-032 | Farbliche Darstellung: 0% rot, 25-75% gelb, 100% grün         |
| LA-033 | Warnung bei überfälligen Tasks mit % < 100                     |

### 3.7 Wiederkehrende Aufgaben

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-034 | Intervalle: Täglich, Wöchentlich, Monatlich, Jährlich, Custom |
| LA-035 | Bei Abschluss wird automatisch neue Aufgabe erstellt           |
| LA-036 | Wiederkehrende Aufgaben werden mit Symbol markiert             |

### 3.8 Erinnerungen

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-037 | Desktop-Benachrichtigungen via Obsidian Notice API             |
| LA-038 | Erinnerungszeit pro Aufgabe konfigurierbar                     |
| LA-039 | Tägliche Zusammenfassung beim Öffnen von Obsidian (optional)   |

### 3.9 Excel-Export

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-040 | Ein-Klick-Export-Button im Dashboard                           |
| LA-041 | Exakte Spaltenstruktur für Excel                               |
| LA-042 | ERLEDIGT-Zelle enthält Excel-Formel                            |
| LA-043 | Mehrzeilige Notizen bleiben in einer Zelle                     |

### 3.10 Einstellungen

| ID     | Anforderung                                                    |
| ------ | -------------------------------------------------------------- |
| LA-044 | Eigene Settings-Page in Obsidian                               |
| LA-045 | Aufgaben-Ordner konfigurierbar                                 |
| LA-046 | Bilder-Ordner konfigurierbar                                   |
| LA-047 | Sprache wählbar (Deutsch/English, erweiterbar)                 |
| LA-048 | Standard-Priorität konfigurierbar                              |
| LA-049 | Standard-Tab konfigurierbar                                    |
| LA-050 | Datumsformat wählbar                                           |
| LA-051 | Tags verwalten (umbenennen, löschen)                           |

---

## 4. Nicht-funktionale Anforderungen

| ID      | Anforderung                                                   |
| ------- | ------------------------------------------------------------- |
| NFA-001 | Desktop + Mobile (iOS/Android) gleichermassen nutzbar         |
| NFA-002 | Performant mit 500+ Aufgaben                                  |
| NFA-003 | Keine externen Plugin-Abhängigkeiten                          |
| NFA-004 | Modularer Aufbau für einfache Erweiterbarkeit                 |
| NFA-005 | Open Source unter MIT License                                 |
| NFA-006 | Veröffentlichung im Obsidian Community Plugin Store           |
| NFA-007 | Mehrsprachig mit i18n-Architektur                             |
| NFA-008 | TypeScript als Programmiersprache                             |

---

## 5. Lieferobjekte

| Lieferobjekt                           | Format                |
| -------------------------------------- | --------------------- |
| Obsidian Plugin                        | TypeScript/JavaScript |
| Quellcode auf GitHub                   | Git Repository        |
| README (DE + EN)                       | Markdown              |
| Benutzerhandbuch                       | Markdown              |
| Eintrag im Obsidian Community Store    | Pull Request          |

---

## 6. Abnahmekriterien

- Alle funktionalen Anforderungen LA-001 bis LA-051 sind umgesetzt
- Alle nicht-funktionalen Anforderungen NFA-001 bis NFA-008 sind erfüllt
- Das Plugin läuft stabil auf Obsidian Desktop und Mobile
- Excel-Export funktioniert mit korrekter Spaltenstruktur und Formel
- Alle automatischen Logiken arbeiten korrekt
- Einstellungsmenü ist vollständig funktional
- Deutsche und englische Oberfläche vorhanden
