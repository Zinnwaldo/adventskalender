// Anzeige und Klicks. Die Regeln selbst stehen in logik.js, die Angaben in daten.js.
import { JAHR, TAGE, KARTEN } from "./daten.js";
import { OEFFNET_UM, istOffen, lage, actVon, kalenderdatei, darfVorschau, vorschauZeit, stand } from "./logik.js";

document.documentElement.classList.add("js");
// Vorschau-Angaben in der Adresse (?zeit=, ?offen=, ?karte=, ?vorschau) zählen nur auf dem eigenen Rechner
const frage = new URLSearchParams(darfVorschau(location.hostname) ? location.search : "");
let JETZT = vorschauZeit(frage.get("zeit")) || new Date();
const $ = (s) => document.querySelector(s);
// Der Wochentag hängt nur vom Datum ab, deshalb wird in Weltzeit gerechnet statt in der Zeit des Geräts
const wochentag = (n, lang) => new Date(Date.UTC(JAHR, 11, n)).toLocaleDateString("de-DE", { weekday: lang ? "long" : "short", timeZone: "UTC" });
const scheibe = (n, klasse = "") => `<span class="scheibe ${klasse}"><span>${n}</span></span>`;
const weg = (t) => `https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lon}`;
const pfeil = (t) => `<span class="pfeilhuelle"><a class="pfeil" href="${weg(t)}" target="_blank" rel="noopener"><span>Weg zeigen</span></a></span>`;

let L = lage(JETZT);
const langerOrt = (t) => t.ort.length > 15 ? "lang" : "";

function zeigeHeute() {
  const dino = `<img class="dino" src="bilder/dino-sax.webp" width="520" height="520" alt="">`;
  if (L.phase === "vor") {
    const t = TAGE[0];
    $("#heute").innerHTML = `<div class="kopf">${scheibe(L.tage, "riesig")}<div><span class="schwung wann">noch</span><span class="fett ort">${L.tage === 1 ? "ein Tag" : "Tage"}</span></div></div>
      <div class="zeilen"><p>Das erste Türchen öffnet sich am <b>${wochentag(1, true)}, 1. Dezember, um 19 Uhr</b>: ${t.ort}, ${t.adresse}.</p></div>${pfeil(t)}${dino}`;
  } else if (L.phase === "nach") {
    $("#heute").innerHTML = `<div class="kopf">${scheibe(24, "riesig")}<div><span class="schwung wann">frohe</span><span class="fett ort">Weihnachten</span></div></div>
      <div class="zeilen"><p>Alle 23 Türchen sind gesungen und geklungen. Danke an alle, die dabei waren. Bis zum nächsten Advent!</p></div>${dino}`;
  } else {
    const t = TAGE[L.n - 1];
    const name = actVon(t.n, JETZT);
    const act = istOffen(t.n, JETZT) ? (name ? `Es spielt <b>${name}</b>.` : "Wer spielt, steht noch nicht fest.") : `Wer spielt, verrät das Türchen ${L.morgen ? "morgen " : ""}ab ${OEFFNET_UM} Uhr.`;
    $("#heute").innerHTML = `<div class="kopf">${scheibe(t.n, "riesig")}<div><span class="schwung wann">${L.morgen ? "morgen Abend" : "heute Abend"}</span><span class="fett ort ${langerOrt(t)}">${t.ort}</span></div></div>
      <div class="zeilen"><p>${t.adresse}</p><p>19 Uhr, Eintritt frei</p><p>${act}</p></div>${pfeil(t)}${dino}`;
  }
}

function zeigeListe() {
  $("#liste").innerHTML = TAGE.map((t) => {
    const heute = L.phase === "laeuft" && t.n === L.n;
    const war = L.phase === "nach" || (L.phase === "laeuft" && t.n < L.n);
    const name = actVon(t.n, JETZT);
    const spielt = name ? `<span class="spielt">${war ? "Es spielte" : "Es spielt"} ${name}</span>` : "";
    return `<li class="${heute ? "jetzt" : war ? "war" : ""}"><button type="button" data-n="${t.n}">${scheibe(t.n)}
      <span><span class="name">${t.ort}</span><span class="adr">${t.adresse}</span>${spielt}</span>
      <span class="tag">${heute ? (L.morgen ? "morgen" : "heute") : wochentag(t.n) + " " + t.n + ".12."}</span></button></li>`;
  }).join("");
}

const merc = (lat) => Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180));
let karteJetzt = "innenstadt";
function zeigeKarte(name) {
  karteJetzt = name;
  const k = KARTEN[name], feld = $("#kartenfeld");
  const bild = $("#kartenbild");
  bild.width = k.breite; bild.height = k.hoehe; bild.src = k.bild;
  feld.querySelectorAll(".nadel").forEach((e) => e.remove());
  document.querySelectorAll(".wahl button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.karte === name));
  const B = feld.clientWidth, H = B * k.hoehe / k.breite;
  const punkte = TAGE.map((t) => {
    let x = (t.lon - k.west) / (k.ost - k.west), y = (merc(k.nord) - merc(t.lat)) / (merc(k.nord) - merc(k.sued));
    const draussen = x < 0.05 || x > 0.95 || y < 0.07 || y > 0.93;
    const winkel = Math.atan2(y - 0.5, x - 0.5) * 180 / Math.PI;
    x = Math.min(0.92, Math.max(0.08, x)); y = Math.min(0.9, Math.max(0.1, y));
    return { t, x: x * B, y: y * H, draussen, winkel, heute: L.phase === "laeuft" && t.n === L.n };
  });
  // Wie auf dem Poster: Scheiben, die sich verdecken würden, rücken ein Stück auseinander
  for (let runde = 0; runde < 60; runde++) for (const a of punkte) for (const b of punkte) {
    if (a === b) continue;
    const dx = b.x - a.x || 0.5, dy = b.y - a.y || 0.5, d = Math.hypot(dx, dy), soll = (a.heute || b.heute) ? 48 : (a.draussen || b.draussen) ? 44 : 38;
    if (d < soll) { const s = (soll - d) / d / 2; if (!a.heute) { a.x -= dx * s; a.y -= dy * s; } if (!b.heute) { b.x += dx * s; b.y += dy * s; } }
  }
  for (const p of punkte) {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.n = p.t.n;
    b.className = "nadel" + (p.heute ? " heute" : "") + (p.draussen ? " rand" : "");
    b.style.cssText = `left:${Math.min(B - 30, Math.max(30, p.x)) / B * 100}%;top:${p.y / H * 100}%;z-index:${p.heute ? 3 : 1}`;
    b.setAttribute("aria-label", `Türchen ${p.t.n}, ${p.t.ort}`);
    b.innerHTML = scheibe(p.t.n);
    if (p.draussen) { b.firstChild.style.transform = `rotate(${p.winkel}deg)`; b.firstChild.firstChild.style.transform = `rotate(${-p.winkel}deg) scaleX(.82)`; }
    feld.append(b);
  }
}

function oeffne(n) {
  const t = TAGE[n - 1], offen = istOffen(n, JETZT), name = actVon(n, JETZT);
  const figuren = ["einhorn-troete", "dino-tanzt", "einhorn-tanzt", "dino-bass", "einhorn-schlittschuh", "einhorn-rentier"];
  const inhalt = offen
    ? (name ? `<span class="schwung es">es spielt</span><span class="fett act">${name}</span>` : `<p class="geheim">Wer spielt, steht noch nicht fest.</p>`)
    : `<p class="geheim">Wer spielt, verrät dieses Türchen am ${t.n}. Dezember ab ${OEFFNET_UM} Uhr.</p>`;
  $("#fenster").innerHTML = `<div class="tuerhuelle">${scheibe(n, "riesig")}<div class="tuer">
    <button class="zu" type="button" data-zu>schließen</button>
    <span class="schwung datum">${wochentag(n, true)}, ${n}. Dezember</span>
    <span class="fett ort ${langerOrt(t)}" id="tuer-ort">${t.ort}</span>
    <p>${t.adresse}</p><p>19 Uhr, Eintritt frei, etwa 30 Minuten</p>
    ${inhalt}${pfeil(t)}
    <p class="merken"><button class="strich" type="button" data-kalender="${n}">In den Kalender eintragen</button></p>
    <img class="figur" src="bilder/${figuren[n % figuren.length]}.webp" alt=""></div></div>`;
  $("#fenster").showModal();
}

function ladeKalender(welche) {
  const tage = welche === "alle" ? TAGE : [TAGE[welche - 1]];
  const link = document.createElement("a");
  link.hidden = true;
  link.href = URL.createObjectURL(new Blob([kalenderdatei(tage, JETZT)], { type: "text/calendar;charset=utf-8" }));
  link.download = welche === "alle" ? "adventskalender-schwerin-2026.ics" : `adventskalender-tuerchen-${welche}.ics`;
  // Der Link muss im Dokument hängen und eine Weile gültig bleiben: das iPhone fragt erst nach, bevor es die Datei holt
  document.body.append(link);
  link.click();
  setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 60000);
}

// Goldstaub, Sterne und Noten wie auf dem Poster, mit festem Zufall, damit jedes Blatt gleich bleibt
function streue(svg, saat) {
  let s = saat; const z = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const w = svg.clientWidth, h = svg.clientHeight; svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  let aus = "";
  const haufen = Array.from({ length: 5 }, () => [z() * w, z() * h]);
  for (let i = 0; i < +svg.dataset.punkte * Math.max(1, w / 500); i++) {
    const [hx, hy] = haufen[Math.floor(z() * haufen.length)], frei = z() < 0.35;
    const x = frei ? z() * w : hx + (z() - 0.5) * 260, y = frei ? z() * h : hy + (z() - 0.5) * 260;
    aus += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(z() ** 3 * 5.5 + 0.9).toFixed(1)}" fill="#f6c453" opacity="${(0.55 + z() * 0.45).toFixed(2)}"/>`;
  }
  const orte = (t) => (t || "").split(" ").filter(Boolean).map((o) => o.split(":").map(Number)).map(([x, y]) => [x / 100 * w, y]);
  for (const [x, y] of orte(svg.dataset.sterne)) aus += `<g transform="translate(${x.toFixed(0)} ${y}) rotate(${(z() * 70 - 35).toFixed(0)})">${stern(11 + z() * 8, z)}</g>`;
  for (const [x, y] of orte(svg.dataset.noten)) aus += `<text x="${x.toFixed(0)}" y="${y}" font-size="${(24 + z() * 12).toFixed(0)}" fill="#150f20" transform="rotate(${(z() * 40 - 20).toFixed(0)})" style="transform-box:fill-box;transform-origin:center">${z() < 0.5 ? "♪" : "♫"}</text>`;
  svg.innerHTML = aus;
}
function stern(r, z = Math.random) {
  const p = Array.from({ length: 10 }, (_, i) => { const a = Math.PI * i / 5 - Math.PI / 2, l = (i % 2 ? r * 0.46 : r) * (0.9 + z() * 0.2); return `${(Math.cos(a) * l).toFixed(1)},${(Math.sin(a) * l).toFixed(1)}`; }).join(" ");
  return `<polygon points="${p}" fill="#f6c453" stroke="#150f20" stroke-width="1.8" stroke-linejoin="round"/><polygon points="${p}" fill="none" stroke="#150f20" stroke-width="1" stroke-linejoin="round" transform="translate(1.6 1.2) rotate(4)"/>`;
}

zeigeHeute(); zeigeListe(); zeigeKarte(frage.get("karte") || "innenstadt");
// Die Regeln stehen fest im HTML, hier bekommen sie nur ihren handgezeichneten Stern
document.querySelectorAll("#regeln li").forEach((li) => li.insertAdjacentHTML("afterbegin", `<svg viewBox="-14 -14 28 28">${stern(11)}</svg>`));
document.querySelectorAll(".staub").forEach((s, i) => streue(s, 7 + i * 131));
document.addEventListener("click", (e) => {
  const v = e.target.closest("[data-zeit]");
  if (v) {
    JETZT = vorschauZeit(v.dataset.zeit) || new Date(); L = lage(JETZT);
    document.querySelectorAll("[data-zeit]").forEach((b) => b.setAttribute("aria-pressed", b === v));
    zeigeHeute(); zeigeListe(); return zeigeKarte(karteJetzt);
  }
  const kal = e.target.closest("[data-kalender]");
  if (kal) {
    // In den eingebauten Browsern von Instagram und Facebook passiert beim Herunterladen oft nichts, deshalb ein Hinweis
    if (!kal.parentNode.querySelector(".hinweis")) kal.insertAdjacentHTML("afterend", `<span class="hinweis" role="status">Tut sich nichts? Öffne die Seite in Safari oder Chrome.</span>`);
    return ladeKalender(kal.dataset.kalender === "alle" ? "alle" : +kal.dataset.kalender);
  }
  const n = e.target.closest("[data-n]"); if (n) return oeffne(+n.dataset.n);
  const k = e.target.closest("[data-karte]"); if (k) return zeigeKarte(k.dataset.karte);
  if (e.target.closest("[data-zu]") || e.target === $("#fenster")) $("#fenster").close();
});
if (frage.has("vorschau")) $("#vorschau").hidden = false;
if (frage.get("offen")) oeffne(+frage.get("offen"));

// Bleibt die Seite über Nacht offen, darf sie nicht den Abend von gestern zeigen.
// Geprüft wird jede Minute und immer, wenn die Seite wieder in den Vordergrund kommt.
const festeVorschau = frage.has("zeit");
let letzterStand = stand(JETZT);
function pruefeZeit() {
  if (festeVorschau || $("#vorschau [aria-pressed=true][data-zeit]:not([data-zeit=\"\"])")) return;
  const jetzt = new Date();
  if (stand(jetzt) === letzterStand) return;
  JETZT = jetzt; L = lage(JETZT); letzterStand = stand(jetzt);
  zeigeHeute(); zeigeListe(); zeigeKarte(karteJetzt);
}
setInterval(pruefeZeit, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) pruefeZeit(); });
window.addEventListener("pageshow", pruefeZeit);
