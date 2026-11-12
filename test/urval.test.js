const { test } = require('node:test');
const assert = require('node:assert');
const { valjForhallanden, nederbordsTyp, byggLage, NEUTRALT } = require('../vader.js');

/* Ett fullständigt, lugnt grundvärde som varje fall utgår från. */
const lugnKlarDag = {
  weather_code: 0, precipitation: 0, visibility: 24000, temperature_2m: 18,
  cloud_cover: 5, relative_humidity_2m: 50, pressure_msl: 1015, is_day: 1,
  wind_speed_10m: 12, wind_direction_10m: 240,
};
const med = extra => Object.assign({}, lugnKlarDag, extra);

/* --- de fyra fall som krävs ------------------------------------------- */

test('lugn klar dag faller tillbaka på temperatur, molnighet och dygnstid', () => {
  assert.deepStrictEqual(valjForhallanden(lugnKlarDag),
    ['temperatur', 'molnighet', 'dygnstid']);
});

test('åskväder med regn och dimma trycker ut de lugna förhållandena', () => {
  const v = med({ weather_code: 95, precipitation: 4.2, visibility: 600,
                  cloud_cover: 100, relative_humidity_2m: 96, pressure_msl: 994 });
  assert.deepStrictEqual(valjForhallanden(v), ['aska', 'nederbord', 'dimma']);
});

test('fuktigt och mulet utan regn ger temperatur, molnighet och luftfuktighet', () => {
  const v = med({ weather_code: 3, precipitation: 0, visibility: 8000,
                  temperature_2m: 9, cloud_cover: 100, relative_humidity_2m: 93 });
  assert.deepStrictEqual(valjForhallanden(v),
    ['temperatur', 'molnighet', 'luftfuktighet']);
});

test('saknat värde flyttar upp nästa förhållande i rangordningen', () => {
  const fullstandig = med({ relative_humidity_2m: 95 });
  assert.deepStrictEqual(valjForhallanden(fullstandig),
    ['temperatur', 'molnighet', 'luftfuktighet'], 'de tre översta som förekommer');

  const utanTemp = med({ relative_humidity_2m: 95, temperature_2m: null });
  assert.deepStrictEqual(valjForhallanden(utanTemp),
    ['molnighet', 'luftfuktighet', 'dygnstid'],
    'temperaturen saknas, så dygnstiden flyttas upp i de tre');
});

/* --- saknade värden i alla former ------------------------------------- */

test('null, undefined och NaN räknas alla som att värdet saknas', () => {
  for (const tomt of [null, undefined, NaN]) {
    const v = med({ cloud_cover: tomt, relative_humidity_2m: 95 });
    assert.deepStrictEqual(valjForhallanden(v),
      ['temperatur', 'luftfuktighet', 'dygnstid'], `gäller även för ${String(tomt)}`);
  }
});

test('tomt väderunderlag ger inga förhållanden alls i stället för att krascha', () => {
  assert.deepStrictEqual(valjForhallanden({}), []);
  assert.deepStrictEqual(valjForhallanden(undefined), []);
});

/* --- rangordningen ----------------------------------------------------- */

test('aldrig fler än tre', () => {
  const allt = med({ weather_code: 95, precipitation: 9, visibility: 300,
                     relative_humidity_2m: 97, pressure_msl: 970 });
  assert.strictEqual(valjForhallanden(allt).length, 3);
});

test('spårmängd nederbörd räknas inte, 0,1 mm gör det', () => {
  assert.ok(!valjForhallanden(med({ precipitation: 0.05 })).includes('nederbord'));
  assert.ok(valjForhallanden(med({ precipitation: 0.1 })).includes('nederbord'));
});

test('dimma kräver sikt under en kilometer', () => {
  assert.ok(!valjForhallanden(med({ visibility: 1000 })).includes('dimma'));
  assert.ok(valjForhallanden(med({ visibility: 999 })).includes('dimma'));
});

test('luftfuktighet och lufttryck räknas bara utanför sina spann', () => {
  assert.ok(!valjForhallanden(med({ relative_humidity_2m: 80 })).includes('luftfuktighet'));
  assert.ok(valjForhallanden(med({ relative_humidity_2m: 29, temperature_2m: null }))
    .includes('luftfuktighet'));
  assert.ok(!valjForhallanden(med({ pressure_msl: 1010 })).includes('lufttryck'));
  assert.ok(valjForhallanden(med({ pressure_msl: 1026, temperature_2m: null,
    cloud_cover: null })).includes('lufttryck'));
});

test('vinden påverkar inte urvalet och är aldrig ett av de tre', () => {
  const stiltje = valjForhallanden(med({ wind_speed_10m: 0, wind_direction_10m: 0 }));
  const storm = valjForhallanden(med({ wind_speed_10m: 120, wind_direction_10m: 180 }));
  assert.deepStrictEqual(stiltje, storm);
  assert.ok(!storm.includes('vind'));
});

/* --- blandad nederbörd -------------------------------------------------- */

test('väderkoden avgör dominerande nederbördstyp', () => {
  assert.strictEqual(nederbordsTyp({ weather_code: 73 }), 'sno');
  assert.strictEqual(nederbordsTyp({ weather_code: 96 }), 'hagel');
  assert.strictEqual(nederbordsTyp({ weather_code: 53 }), 'dugg');
  assert.strictEqual(nederbordsTyp({ weather_code: 81 }), 'regn');
});

test('utan väderkod avgör mängderna, och snödjup väger tyngre än millimeter regn', () => {
  assert.strictEqual(nederbordsTyp({ snowfall: 0.4, rain: 1.0 }), 'sno');
  assert.strictEqual(nederbordsTyp({ snowfall: 0.02, rain: 1.0 }), 'regn');
  assert.strictEqual(nederbordsTyp({ rain: 0.2 }), 'dugg');
});

/* --- lägen och neutrala grundvärden ------------------------------------ */

test('en egenskap vars förhållande inte valdes behåller sitt neutrala grundläge', () => {
  const v = med({ weather_code: 95, precipitation: 4, visibility: 600 });
  const lage = byggLage(valjForhallanden(v), v);
  assert.deepStrictEqual(lage.valda, ['aska', 'nederbord', 'dimma']);
  assert.strictEqual(lage.fargTon, NEUTRALT.fargTon, 'temperaturen valdes inte, färgen är neutral');
  assert.strictEqual(lage.klump, NEUTRALT.klump);
  assert.strictEqual(lage.ljus, NEUTRALT.ljus);
  assert.strictEqual(lage.aska, true);
  assert.strictEqual(lage.fallTyp, 'regn');
  assert.ok(lage.djup > 0, 'dimman sätter djup');
});

test('kallt ger isblått och varmt ger bärnsten', () => {
  const kallt = byggLage(['temperatur'], { temperature_2m: -10 });
  const varmt = byggLage(['temperatur'], { temperature_2m: 30 });
  assert.ok(kallt.fargTon < 0.05);
  assert.ok(varmt.fargTon > 0.95);
});

test('natt sänker ljuset, dag håller det uppe', () => {
  assert.ok(byggLage(['dygnstid'], { is_day: 0 }).ljus < 1);
  assert.strictEqual(byggLage(['dygnstid'], { is_day: 1 }).ljus, 1);
});

test('molnighet och nederbörd samsas om tätheten i stället för att skriva över', () => {
  const bas = { visibility: 24000, temperature_2m: 10, cloud_cover: 80,
                relative_humidity_2m: 60, pressure_msl: 1013, is_day: 1 };
  const mulet = byggLage(['molnighet'], bas);
  const duggMulet = byggLage(['nederbord', 'temperatur', 'molnighet'],
    Object.assign({}, bas, { weather_code: 51, precipitation: 0.3 }));
  const haglMulet = byggLage(['nederbord', 'temperatur', 'molnighet'],
    Object.assign({}, bas, { weather_code: 96, precipitation: 5 }));

  assert.ok(duggMulet.taktFaktor < mulet.taktFaktor, 'duggregn är glesare än bara mulet');
  assert.ok(haglMulet.taktFaktor > mulet.taktFaktor, 'hagel är tätare än bara mulet');
  assert.ok(Math.abs(duggMulet.taktFaktor - 0.65 * mulet.taktFaktor) < 1e-9,
    'faktorerna multipliceras');
});

test('klar himmel är glesare än mulet och har blänk', () => {
  const bas = { temperature_2m: 10, is_day: 1 };
  const klart = byggLage(['molnighet'], Object.assign({ cloud_cover: 0 }, bas));
  const mulet = byggLage(['molnighet'], Object.assign({ cloud_cover: 100 }, bas));
  assert.ok(klart.taktFaktor < mulet.taktFaktor);
  assert.ok(klart.glans > 0.9 && mulet.glans < 0.1);
});
