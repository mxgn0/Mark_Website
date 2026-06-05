/**
 * WELKLOHS — Terminanfrage → Notion
 * Cloudflare Worker. Nimmt das Terminformular (JSON) entgegen
 * und legt eine Zeile in der Notion-Datenbank an.
 *
 * Secrets / Variablen (im Worker-Dashboard hinterlegen):
 *   NOTION_TOKEN   = secret_xxx   (Internal Integration Secret von notion.so/my-integrations)
 *
 * Die Datenbank "WELKLOHS — Terminanfragen" muss mit der Integration geteilt sein.
 */

const DATABASE_ID = "3d300594-bd85-4f00-921d-9fbbb7aede47";
const NOTION_VERSION = "2022-06-28";

// Von welcher Domain darf das Formular senden? "*" = überall erlaubt.
// Für mehr Sicherheit später z.B. "https://mxgn0.github.io" eintragen.
const ALLOWED_ORIGIN = "*";

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // CORS-Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "Nur POST" }, 405);
    }

    let d;
    try {
      d = await request.json();
    } catch (e) {
      return json({ ok: false, error: "Ungültiges JSON" }, 400);
    }

    const kunde = `${d.vorname || ""} ${d.nachname || ""}`.trim() || "Unbenannt";

    const properties = {
      "Kunde": { title: [{ text: { content: kunde } }] },
      "Fahrzeug": { rich_text: [{ text: { content: d.fahrzeug || "" } }] },
      "Uhrzeit": { rich_text: [{ text: { content: d.uhrzeit || "" } }] },
      "Anliegen": { rich_text: [{ text: { content: d.anliegen || "" } }] },
      "Neukunde / Erstinspektion": { checkbox: d.Neukunde_Erstinspektion === "Ja" },
      "Datenschutz zugestimmt": { checkbox: d.Datenschutz_zugestimmt === "Ja" },
      "Status": { select: { name: "Neu" } },
    };

    // Optionale Felder nur setzen, wenn befüllt (Notion mag keine leeren E-Mail/Telefon-Werte)
    if (d.telefon) properties["Telefon"] = { phone_number: String(d.telefon) };
    if (d.email)   properties["E-Mail"]  = { email: String(d.email) };
    if (d.datum)   properties["Wunschdatum"] = { date: { start: String(d.datum) } };

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: { database_id: DATABASE_ID }, properties }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return json({ ok: false, error: "Notion-Fehler", detail: txt }, 502);
    }

    return json({ ok: true });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
