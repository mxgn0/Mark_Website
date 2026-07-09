# WELKLOHS — Buchungen in Notion einrichten (v2, vereinfacht)

Neue Termine von der Website landen automatisch in **Marks eigenem Notion** — und
damit auch in **Notion Calendar**. Mark fasst **kein Cloudflare** an und baut
**keine Datenbank von Hand**.

```
Website (Kunde bucht)  →  Cloudflare Worker "bookings"  →  Marks Notion-Datenbank
```

Pro Werkstatt ändert sich nur **ein** Ding: in welche Notion-Datenbank geschrieben
wird. Das steuern zwei Cloudflare-Secrets (`NOTION_API_KEY`, `NOTION_DATABASE_ID`).

---

## Zuerst · Casper — Vorlage für Mark freigeben (einmalig)

Es existiert eine fertige, leere Vorlage-Datenbank mit korrektem Schema:
**„WELKLOHS Buchungen — Vorlage für Mark"**.

1. Vorlage öffnen → oben rechts **Teilen** → **Im Web veröffentlichen** →
   Schalter **„Duplizieren als Vorlage erlauben"** an → Link kopieren → an Mark.
   *(Alternativ: Mark direkt über Teilen → Personen einladen hinzufügen.)*

---

## Dann · Mark — drei Schritte in deinem Notion (~5 Min)

**1. Vorlage duplizieren**
Casters Link öffnen → oben rechts **Duplizieren** → deinen Workspace wählen.
Die Datenbank liegt jetzt in *deinem* Notion, alle Spalten korrekt vorbereitet.

**2. Verbindung anlegen & verknüpfen**
1. `notion.so/my-integrations` → **New integration** → Name z. B. „WELKLOHS" → **Submit**
2. **Token** (beginnt mit `ntn_…`) einblenden und kopieren
3. In der duplizierten Datenbank: oben rechts **•••** → **Verbindungen** →
   deine „WELKLOHS"-Verbindung hinzufügen

**3. Zwei Werte an Casper schicken** (WhatsApp genügt)

| Wert | Was |
|------|-----|
| Token | der `ntn_…`-Schlüssel aus Schritt 2 |
| Datenbank-ID | der Teil aus der URL **vor** dem `?v=` → `notion.so/DIESE-ID?v=…` |

> ⚠️ **Nicht umbenennen.** Die Spalten (Name, Termin, Telefon, E-Mail, Fahrzeug,
> Anliegen, Neukunde, Status) müssen so heißen und ihren Typ behalten — sonst
> kommen die Buchungen nicht sauber an. Eigene Ansichten/Filter sind erlaubt.

---

## Zum Schluss · Casper — zwei Werte in Cloudflare (einmalig, ~1 Min)

Cloudflare → Worker **`bookings`** → **Settings** → **Variables and Secrets**.
Die beiden vorhandenen Werte mit Marks Angaben überschreiben:

| Secret | Wert |
|--------|------|
| `NOTION_API_KEY` | Marks Token (`ntn_…`) |
| `NOTION_DATABASE_ID` | Marks Datenbank-ID |

Dann **Deploy**. Ab jetzt schreibt das System in Marks Datenbank statt in deine.

---

## Ergebnis

- Jede Buchung erscheint als neue Zeile in **Marks Notion-Datenbank**.
- Weil **Termin** ein Datumsfeld ist, taucht der Termin automatisch in
  **Notion Calendar** auf — dort die Datenbank als Kalender hinzufügen.
- Das Admin-Panel der Website (Slots sperren, Bestätigung senden) läuft unverändert.

---

## Datenbank-Schema (Referenz)

Falls die Vorlage einmal neu gebaut werden muss:

| Spalte | Typ | Hinweis |
|--------|-----|---------|
| Name | Title | Kunde |
| Termin | Date | Datum + Uhrzeit → Notion Calendar |
| Telefon | Text | |
| E-Mail | Text | |
| Fahrzeug | Text | |
| Anliegen | Text | |
| Neukunde | Checkbox | |
| Status | Select | Optionen: Neu, Bestätigt, Erledigt, Storniert |
