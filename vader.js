/* ==========================================================================
   VÄDRET SOM KONFETTIN VISAR
   Ren logik, inget DOM och inget nätverk, så att den går att testa i node.
   Laddas som vanligt skript i index.html och sätter sina namn på globalThis.

   Varje förhållande äger exakt EN visuell egenskap. Därför kan de tre som
   väljs aldrig krocka med varandra — och inte heller med vinden, som alltid
   är på och aldrig räknas som ett av de tre.
   ========================================================================== */
(function (yttre) {

/* Startvärden. Ligger samlade här så att de går att justera utan att röra
   logiken under. */
const TROSKLAR = {
  askkoder:     [95, 96, 99],   // WMO: åska, åska med lätt/kraftigt hagel
  nederbordMm:  0.1,            // mm/h — spårmängd räknas inte
  siktM:        1000,           // meter
  fuktHog:      80,             // procent
  fuktLag:      30,
  tryckLagt:    1000,           // hPa
  tryckHogt:    1025,
};

/* Rangordningen. Det första som förekommer vinner, sedan nästa, sedan nästa. */
const RANGORDNING = [
  'aska', 'nederbord', 'dimma', 'temperatur',
  'molnighet', 'luftfuktighet', 'lufttryck', 'dygnstid',
];

/* Ett värde som saknas i datan räknas som att förhållandet inte förekommer. */
const finns = x => x !== null && x !== undefined && !Number.isNaN(x);

function forekommer(nyckel, v, t = TROSKLAR) {
  switch (nyckel) {
    case 'aska':
      return finns(v.weather_code) && t.askkoder.indexOf(v.weather_code) !== -1;
    case 'nederbord':
      return finns(v.precipitation) && v.precipitation >= t.nederbordMm;
    case 'dimma':
      return finns(v.visibility) && v.visibility < t.siktM;
    case 'temperatur':
      return finns(v.temperature_2m);
    case 'molnighet':
      return finns(v.cloud_cover);
    case 'luftfuktighet':
      return finns(v.relative_humidity_2m) &&
        (v.relative_humidity_2m > t.fuktHog || v.relative_humidity_2m < t.fuktLag);
    case 'lufttryck':
      return finns(v.pressure_msl) &&
        (v.pressure_msl < t.tryckLagt || v.pressure_msl > t.tryckHogt);
    case 'dygnstid':
      return finns(v.is_day);
    default:
      return false;
  }
}

function valjForhallanden(v, t = TROSKLAR) {
  const d = v || {};
  return RANGORDNING.filter(n => forekommer(n, d, t)).slice(0, 3);
}

/* --- Nederbördens typ ----------------------------------------------------
   Blandad nederbörd avgörs i första hand av väderkoden, som redan uttrycker
   vad SMHI:s motsvarighet kallar dominerande typ. Saknas koden får mängderna
   avgöra: snödjup i cm räknas om till ungefär vattenekvivalent millimeter. */
const KOD = {
  hagel: [96, 99],
  sno:   [71, 73, 75, 77, 85, 86],
  dugg:  [51, 53, 55, 56, 57],
  regn:  [61, 63, 65, 66, 67, 80, 81, 82],
};

function nederbordsTyp(v) {
  const k = v.weather_code;
  if (finns(k)) {
    for (const typ of ['hagel', 'sno', 'dugg', 'regn'])
      if (KOD[typ].indexOf(k) !== -1) return typ;
  }
  const sno = (v.snowfall || 0) * 10;              // cm snö ≈ 10 mm fallande djup
  const vatt = (v.rain || 0) + (v.showers || 0);
  if (sno > vatt) return 'sno';
  if (vatt > 0 && vatt < 0.5) return 'dugg';
  return 'regn';
}

/* --- Neutrala grundlägen -------------------------------------------------
   En visuell egenskap vars förhållande inte valdes hamnar här. Neutral färg
   är null, vilket betyder den ursprungliga flerfärgade paletten. */
const NEUTRALT = {
  fargTon:    null,   // null = originalpaletten, annars 0 isblå … 1 bärnsten
  fallTyp:    'inget',
  fallFart:   1,      // multiplikator på fallhastigheten
  fallDrag:   6,      // luftmotstånd i höjdled
  tumlar:     1,      // rotationshastighet
  langd:      1,      // utdragen form
  storlek:    1,
  studsar:    false,
  laggerSig:  false,
  taktFaktor: 1,      // multiplikator på regnets takt
  glans:      0,      // 0 matt … 1 metallisk blänk vid rotation
  djup:       0,      // 0 inget djup … 1 kraftig djuposkärpa
  klump:      0,      // 0 separata … 1 tydliga klungor
  drift:      0,      // negativ stiger, positiv sjunker
  rastlos:    0,
  ljus:       1,      // övergripande ljusstyrka
  varmt:      0,      // -1 kall ljusfärg … 1 varm
  aska:       false,
};

const mellan = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));

/* Varje gren rör bara sin egen egenskap. */
const LAGEN = {
  aska: () => ({ aska: true }),

  nederbord: v => {
    const typ = nederbordsTyp(v);
    if (typ === 'sno')
      return { fallTyp: typ, fallFart: 0.45, fallDrag: 9, tumlar: 2.6,
               langd: 1, storlek: 0.85, laggerSig: true, taktFaktor: 1.15 };
    if (typ === 'dugg')
      return { fallTyp: typ, fallFart: 0.8, fallDrag: 7, tumlar: 1.1,
               langd: 1.4, storlek: 0.38, taktFaktor: 0.65 };
    if (typ === 'hagel')
      return { fallTyp: typ, fallFart: 1.5, fallDrag: 3.5, tumlar: 1.6,
               langd: 1, storlek: 0.55, studsar: true, taktFaktor: 1.5 };
    return { fallTyp: 'regn', fallFart: 1.8, fallDrag: 2.5, tumlar: 0.45,
             langd: 2.2, storlek: 0.8, taktFaktor: 1.3 };
  },

  /* Ju sämre sikt, desto mer tonar de bortre bitarna ut. */
  dimma: v => ({ djup: mellan(1, 0.35, (v.visibility || 0) / TROSKLAR.siktM) }),

  /* -10 °C ger isblått, +30 °C ger varm bärnsten. */
  temperatur: v => ({ fargTon: mellan(0, 1, ((v.temperature_2m) + 10) / 40) }),

  /* Klar himmel ger glesa bitar med blänk, mulet ger tätare och matta. */
  molnighet: v => {
    const m = (v.cloud_cover || 0) / 100;
    return { taktFaktor: mellan(0.6, 1.5, m), glans: mellan(1, 0, m) };
  },

  luftfuktighet: v => {
    const f = v.relative_humidity_2m;
    return { klump: f > TROSKLAR.fuktHog
      ? mellan(0.35, 1, (f - TROSKLAR.fuktHog) / (100 - TROSKLAR.fuktHog))
      : 0 };
  },

  /* Lågtryck gör dem rastlösa och lyftande, högtryck lugna och sjunkande. */
  lufttryck: v => {
    const p = v.pressure_msl;
    if (p < TROSKLAR.tryckLagt)
      return { drift: -mellan(0.3, 1.4, (TROSKLAR.tryckLagt - p) / 40),
               rastlos: mellan(0.4, 1, (TROSKLAR.tryckLagt - p) / 40) };
    return { drift: mellan(0.2, 0.9, (p - TROSKLAR.tryckHogt) / 25), rastlos: 0 };
  },

  dygnstid: v => v.is_day
    ? { ljus: 1, varmt: 0.25 }
    : { ljus: 0.55, varmt: -0.4 },
};

/* Bygger hela läget: neutrala grundvärden plus de tre valdas bidrag. */
function byggLage(valda, v) {
  const lage = Object.assign({}, NEUTRALT);
  for (const nyckel of valda || []) {
    if (!LAGEN[nyckel]) continue;
    const bidrag = LAGEN[nyckel](v || {});
    /* taktFaktor är den enda egenskap två förhållanden kan vilja röra samtidigt:
       molnigheten äger tätheten, men duggregn beskrivs som glest och hagel som
       tätt. De multipliceras därför i stället för att skriva över varandra —
       annars avgör rangordningen vem som vinner, vilket ger ett glest duggregn
       samma täthet som en mulen dag. */
    if (bidrag.taktFaktor !== undefined) {
      lage.taktFaktor *= bidrag.taktFaktor;
      delete bidrag.taktFaktor;
    }
    Object.assign(lage, bidrag);
  }
  lage.valda = (valda || []).slice();
  return lage;
}

const api = { TROSKLAR, RANGORDNING, NEUTRALT, forekommer, valjForhallanden,
              nederbordsTyp, byggLage };

if (typeof module !== 'undefined' && module.exports) module.exports = api;
else Object.assign(yttre, api);

})(typeof globalThis !== 'undefined' ? globalThis : this);
