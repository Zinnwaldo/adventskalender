// Alle Angaben zu den 23 Abenden. Wer hier etwas ändert, ruft danach `node werkzeug/baue.mjs` auf.
export const JAHR = 2026, LETZTER = 23;
export const TAGE = [
  { n: 1,  ort: "Marianas Musikfenster", adresse: "Lindenstraße 9", lat: 53.632644, lon: 11.418544 },
  { n: 2,  ort: "Goethe-Gymnasium", adresse: "Johannes-R.-Becher-Straße 10, vor der Aula", lat: 53.637029, lon: 11.393113 },
  { n: 3,  ort: "Ärztehaus", adresse: "Rahlstedter Straße 29", lat: 53.647925, lon: 11.36507 },
  { n: 4,  ort: "Karl-Liebknecht-Platz", adresse: "Karl-Liebknecht-Platz 6", lat: 53.622907, lon: 11.404584 },
  { n: 5,  ort: "Mueßer Holz", adresse: "Kepler Passage", lat: 53.591134, lon: 11.467235 },
  { n: 6,  ort: "St. Anna", adresse: "Klosterstraße 26", lat: 53.627205, lon: 11.413004 },
  { n: 7,  ort: "Stephanus-Hof", adresse: "Körnerstraße 7", lat: 53.631752, lon: 11.4158 },
  { n: 8,  ort: "Kreativkaufhaus", adresse: "Klöresgang 5", lat: 53.629212, lon: 11.409166 },
  { n: 9,  ort: "Demmlerplatz", adresse: "Demmlerplatz 1", lat: 53.631281, lon: 11.399823 },
  { n: 10, ort: "PAUL Holzwerkstatt", adresse: "Hof der Werderstraße 19a", lat: 53.636233, lon: 11.421565 },
  { n: 11, ort: "Nachbarschaftstreff Weststadt", adresse: "Lessingstraße 26a", lat: 53.634552, lon: 11.392194 },
  { n: 12, ort: "Hof Familie Scharf", adresse: "Hof in der Bornhövedstraße 58", lat: 53.634369, lon: 11.427547 },
  { n: 13, ort: "Schwerin singt", adresse: "Alter Garten 1", lat: 53.6266, lon: 11.416541 },
  { n: 14, ort: "Alte Post", adresse: "vor der Alten Post am Berliner Platz 4", lat: 53.598463, lon: 11.448603 },
  { n: 15, ort: "Paulskirche", adresse: "Am Packhof 8", lat: 53.632027, lon: 11.40845 },
  { n: 16, ort: "Skatepark Lankow", adresse: "Ratzeburger Straße 44", lat: 53.651721, lon: 11.360642 },
  { n: 17, ort: "Flotte Weihnachten", adresse: "Werderstraße 140", lat: 53.626226, lon: 11.419558 },
  { n: 18, ort: "Taschengarten Münzstraße", adresse: "Münzstraße / Fischerstraße", lat: 53.630729, lon: 11.418075 },
  { n: 19, ort: "Freilichtmuseum", adresse: "Alte Crivitzer Landstraße 13", lat: 53.600172, lon: 11.478685 },
  { n: 20, ort: "Hotel Speicher", adresse: "Uferpromenade", lat: 53.641334, lon: 11.419895 },
  { n: 21, ort: "Domportal", adresse: "Am Dom", lat: 53.629723, lon: 11.414431 },
  { n: 22, ort: "Café Löwenherz", adresse: "Obotritenring 245", lat: 53.624598, lon: 11.400154 },
  { n: 23, ort: "Ziegenmarkt", adresse: "Ziegenmarkt 11", lat: 53.632128, lon: 11.41994 }
];
// Wer spielt, steht hier verschleiert, damit weder Suchmaschinen noch ein flüchtiger Blick es vorab verraten.
// Nicht von Hand ändern: `node werkzeug/act.mjs 4 "Name"` trägt einen Act ein.
/* ACTS-ANFANG */
export const ACTS = {
  1: "IB0AUiwaDAkdGwQeQzgADwYZARsVDRcdVBoDUigdEgsdAQ==",
  2: "NjQiNTA=",
  3: "JxYNBQYaDAARB0U5D6vTAB+20wIT",
  7: "PhQfCAIcBBY=",
  8: "PhQfCAgHCAy3yRYX",
  9: "NhkEAQwaBgYRBhEXEUgnDxoPDh0U",
  10: "JxYKHAYAAA8Q",
  11: "IxBFJhQH",
  13: "JxYNBQYaDABUBgwcBBw=",
  14: "NhAEBxcBAxsYVSsdChsA",
  15: "JxwLFQYGRQMdAUUwBgYPDxkcCw==",
  16: "MgcAGwYaRS0cGhdSMAsNGREHDBw=",
  17: "JhoEFkM8FwcEVSEHDA==",
  18: "PxQBFgIcHw==",
  19: "PBwLBgYaDQES",
  20: "IB0AUiYJFxkdEhY=",
  21: "PxQLBgwaAAc=",
  22: "OAALE0M7ChsY"
};
/* ACTS-ENDE */
export const KARTEN = {
  innenstadt: { bild: "bilder/karte-innenstadt.jpg", breite: 1500, hoehe: 1350, nord: 53.64463782485651, sued: 53.615320925750595, west: 11.3818359375, ost: 11.436767578125 },
  stadt: { bild: "bilder/karte-stadt.jpg", breite: 1300, hoehe: 1137, nord: 53.670680193472634, sued: 53.579461493732296, west: 11.337890625, ost: 11.513671875 }
};
