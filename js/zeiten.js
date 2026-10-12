/* ============================================================
   WELKLOHS – Terminzeiten
   Eine Stelle für Website-Kalender (calendar.js) und Admin-Panel.
   ============================================================ */

/* Wochentag (0 = Sonntag) → [erster Termin, Feierabend].
   Termine im 30-Minuten-Takt; der letzte beginnt eine halbe Stunde
   vor Feierabend. Tage, die hier fehlen, sind nicht buchbar. */
const TERMINZEITEN = {
  1: ['08:00', '18:00'],   // Mo
  2: ['08:00', '18:00'],   // Di
  3: ['08:00', '18:00'],   // Mi
  4: ['08:00', '18:00'],   // Do
  5: ['08:00', '18:00'],   // Fr
  6: ['08:00', '16:00'],   // Sa
};
const TERMIN_TAKT = 30; // Minuten

/* Alle Startzeiten eines Wochentags, z. B. ['08:00', '08:30', …] */
function terminSlots(dow) {
  const z = TERMINZEITEN[dow];
  if (!z) return [];
  const min = t => { const [h, m] = t.split(':'); return +h * 60 + +m; };
  const hm  = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const out = [];
  for (let t = min(z[0]); t < min(z[1]); t += TERMIN_TAKT) out.push(hm(t));
  return out;
}
