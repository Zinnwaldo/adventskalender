// Reine Logik ohne Browser: Zeit, Türchen-Regel, Kalenderdatei. Wird von seite.js und von den Tests benutzt.
import { JAHR, LETZTER, ACTS } from "./daten.js";

// Ab wann ist ein Türchen offen, also wann verraten Seite und Kalender, wer spielt?
// Karstens Regel (18.11.2026): am jeweiligen Tag morgens um 6 Uhr, und zwar nach Schweriner Uhr.
export const OEFFNET_UM = 6;

const uhr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
// Datum und Uhrzeit in Schwerin, egal wie das Gerät eingestellt ist
export function berlin(jetzt) {
  const t = Object.fromEntries(uhr.formatToParts(jetzt).map((p) => [p.type, +p.value]));
  return { jahr: t.year, monat: t.month, tag: t.day, stunde: t.hour, minute: t.minute };
}
// Eine vergleichbare Zahl aus Jahr, Monat, Tag, Stunde, Minute: 202612090600 ist der 9.12.2026 um 6:00 Uhr
const marke = (jahr, monat, tag, stunde = 0, minute = 0) => (((jahr * 100 + monat) * 100 + tag) * 100 + stunde) * 100 + minute;
const marke_von = (jetzt) => { const b = berlin(jetzt); return marke(b.jahr, b.monat, b.tag, b.stunde, b.minute); };

export function istOffen(n, jetzt) {
  return marke_von(jetzt) >= marke(JAHR, 12, n, OEFFNET_UM);
}
export function lage(jetzt) {
  const b = berlin(jetzt), m = marke_von(jetzt);
  if (m < marke(JAHR, 12, 1)) return { phase: "vor", tage: Math.round((Date.UTC(JAHR, 11, 1) - Date.UTC(b.jahr, b.monat - 1, b.tag)) / 864e5) };
  if (m >= marke(JAHR, 12, LETZTER, 20)) return { phase: "nach" };
  const vorbei = b.stunde >= 20;
  return { phase: "laeuft", n: b.tag + (vorbei ? 1 : 0), morgen: vorbei, heuteNr: b.tag };
}

// Ein Kürzel für alles, was auf der Seite von der Uhrzeit abhängt: Phase, gezeigter Abend, offene Türchen.
// Bleibt die Seite offen und das Kürzel ändert sich, zeichnet seite.js neu.
export function stand(jetzt) {
  const l = lage(jetzt);
  let offen = 0;
  for (let n = 1; n <= LETZTER; n++) if (istOffen(n, jetzt)) offen++;
  return [l.phase, l.tage ?? "", l.n ?? "", l.heuteNr ?? "", offen].join("|");
}

// Verschleierung der Acts: Bytes des Namens mit einem festen Schlüssel verrechnen (XOR), dann als Base64 schreiben.
// Das ist kein Schutz vor jemandem, der programmieren kann. Es verhindert Zufallsfunde und Suchtreffer.
const SCHLUESSEL = new TextEncoder().encode("tuerchen");
const mische = (bytes) => bytes.map((b, i) => b ^ SCHLUESSEL[i % SCHLUESSEL.length]);
export function verhuelle(klartext) {
  return btoa(String.fromCharCode(...mische(new TextEncoder().encode(klartext))));
}
export function enthuelle(code) {
  return new TextDecoder().decode(mische(Uint8Array.from(atob(code), (z) => z.charCodeAt(0))));
}
// Die einzige Stelle, die einen Act entschlüsselt. Vor 6 Uhr und ohne Eintrag gibt es nichts.
export function actVon(n, jetzt) {
  return istOffen(n, jetzt) && ACTS[n] ? enthuelle(ACTS[n]) : null;
}

// Vorschau mit ?zeit=… gibt es nur auf dem eigenen Rechner, sonst könnte jeder den 24.12. vortäuschen
export function darfVorschau(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}
// Liest "2026-12-09T18:30" als Schweriner Ortszeit
export function vorschauZeit(text) {
  const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(text || "");
  if (!m) return null;
  const [jahr, monat, tag, stunde, minute] = m.slice(1).map(Number);
  const alsWeltzeit = Date.UTC(jahr, monat - 1, tag, stunde, minute);
  // Wie weit geht die Schweriner Uhr der Weltzeit voraus? Im Winter eine Stunde, im Sommer zwei.
  const b = berlin(new Date(alsWeltzeit));
  const vorsprung = Date.UTC(b.jahr, b.monat - 1, b.tag, b.stunde, b.minute) - alsWeltzeit;
  return new Date(alsWeltzeit - vorsprung);
}

/* KALENDER-ANFANG */
// Baut eine Kalenderdatei (iCalendar, .ics) für die übergebenen Türchen. Wird vom Bauschritt benutzt (werkzeug/baue.mjs),
// die fertigen Dateien liegen in kalender/. Auf der Seite selbst läuft diese Funktion nicht mehr.
// Der Act steht nur drin, wenn das Türchen schon offen ist, sonst würde die Datei die Überraschung verraten.
export function kalenderdatei(tage, jetzt) {
  const zwei = (z) => String(z).padStart(2, "0");
  const sauber = (text) => text.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  // Zeilen dürfen höchstens 75 Bytes lang sein, längere werden mit Zeilenumbruch plus Leerzeichen fortgesetzt.
  // Gezählt wird in Bytes, nicht in Buchstaben: ein Umlaut braucht zwei.
  const bytes = (text) => new TextEncoder().encode(text).length;
  const falten = (zeile) => {
    const teile = [""];
    for (const zeichen of zeile) {
      if (bytes(teile[teile.length - 1] + zeichen) > 73) teile.push("");
      teile[teile.length - 1] += zeichen;
    }
    return teile.join("\r\n ");
  };
  const stempel = jetzt.toISOString().replace(/[-:]|\.\d+/g, "");
  const zeilen = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//musiKKlub//Singender klingender Adventskalender//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Singender klingender Adventskalender"];
  for (const t of tage) {
    const name = actVon(t.n, jetzt);
    const act = name ? `Es spielt ${name}.` : `Wer spielt, verrät das Türchen am Tag selbst ab ${OEFFNET_UM} Uhr.`;
    zeilen.push("BEGIN:VEVENT",
      `UID:tuerchen-${t.n}-${JAHR}@musikklub.com`,
      `DTSTAMP:${stempel}`,
      // 19:00 Uhr in Schwerin ist im Dezember 18:00 Uhr Weltzeit (UTC), deshalb das Z am Ende
      `DTSTART:${JAHR}12${zwei(t.n)}T180000Z`,
      `DTEND:${JAHR}12${zwei(t.n)}T183000Z`,
      `SUMMARY:${sauber(`Türchen ${t.n}: ${t.ort}`)}`,
      `LOCATION:${sauber(`${t.ort}, ${t.adresse}, Schwerin`)}`,
      `GEO:${t.lat};${t.lon}`,
      `DESCRIPTION:${sauber(`Der singende klingende Adventskalender. ${act} Eintritt frei, draußen, etwa 30 Minuten.\nwww.musiKKlub.com`)}`,
      "END:VEVENT");
  }
  zeilen.push("END:VCALENDAR");
  return zeilen.map(falten).join("\r\n") + "\r\n";
}
/* KALENDER-ENDE */

// Derselbe Abend als Link für den Google Kalender. Ohne Act, weil der Link schon vor dem Öffnen des Türchens sichtbar ist.
export function googleLink(t) {
  const tag = `${JAHR}12${String(t.n).padStart(2, "0")}`;
  // Leerzeichen als %20 wie im Link, der auf Pixel und iPhone ausprobiert wurde
  const teile = {
    action: "TEMPLATE",
    text: `Türchen ${t.n}: ${t.ort}`,
    dates: `${tag}T180000Z/${tag}T183000Z`,
    location: `${t.ort}, ${t.adresse}, Schwerin`,
    details: "Der singende klingende Adventskalender. Eintritt frei, draußen, etwa 30 Minuten.\nwww.musiKKlub.com",
  };
  return "https://calendar.google.com/calendar/render?" + Object.entries(teile).map(([k, w]) => `${k}=${k === "dates" ? w : encodeURIComponent(w)}`).join("&");
}
