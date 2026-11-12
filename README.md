# Tangentiellt

**Precisionspositionering utan pekdon.**

### → [tangentiellt.notini.se](https://tangentiellt.notini.se)

Lägg båda händerna på tangentbordet och rulla. Tyngdpunkten av det du rör vid
blir en koordinat på jorden, och tjänsten berättar allt den kan hitta om den
punkten: ort och land, vädret, ett fotografi därifrån, onödigt vetande ur
uppslagsverk och artobservationer — och lokalradion som sänder därifrån just nu.

Positionen har inget som helst samband med var du faktiskt befinner dig.

---

## Idén

Utmaningen var att bara få använda tangentbordet. Vi slutade då använda det som
ett tangentbord.

Webbläsaren ger två olika saker för samma tangenttryck. `event.key` säger vilket
**tecken** tangenten gör, och ändras med språk och layout. `event.code` säger
vilken **fysisk tangent** det är, oberoende av allt annat.

Tangentiellt rör aldrig `event.key`. Den läser bara var tangenterna sitter, och
projicerar tangentbordets geometri på jordklotet. Begränsningen är alltså inte
påklistrad — den har en exakt motsvarighet i plattformen.

Och eftersom en rak projektion hade gjort två tredjedelar av tangentbordet till
Stilla havet vred vi den: varje tangent täcker lika mycket **land**. Alla 78
tangenter på en MacBook landar på land.

---

## Bonustekniker

Numreringen följer briefen.

| # | Teknik | |
|---|---|---|
| **5** | Aldrig mus, bara tangentbord | Hela premissen. Ingen klickbar yta finns i gränssnittet — inte ens radions av- och påslag, som ligger på `⌘M`. |
| **8** | Data från ett öppet API | Sju källor, inga nycklar och inga konton. Se nedan. |
| **4** | Geolokalisering, karta med markörer | Karta med markör och osäkerhetscirkel för varje nedslag. |
| **6** | Konfetti: everytime, all the time | Och den **är en avläsning av vädret**: vinden styr driften, och de tre mest talande förhållandena styr fall, färg, täthet, djup och ljus. Regn faller snett i hård vind, snö lägger sig, åska fryser bilden. |
| **7** | Canvas | Konfettin ritas på canvas, och användaren ritar själv i [Tangentbordspenseln](https://tangentiellt.notini.se/rita.html) — se nedan. |

Inte gjort: 3D-gränssnitt, telefonstyrning med mikrofon, kamera eller gyro,
samt parkoppling mellan enheter.

---

## Naturtrogna teckningar

Inmatningsmetoden är inte begränsad till positionering. Samma avläsning av
tangentbordets fysiska yta fungerar lika väl som ritverktyg.

### → [tangentiellt.notini.se/rita.html](https://tangentiellt.notini.se/rita.html)

Proof of concept. Antalet fingrar du håller nere väljer färg, och sex är taket
— inte av designskäl, utan för att ett USB-tangentbord inte rapporterar fler
samtidiga tangenter än så. Hårdvarans begränsning blev paletten.

Rörelsemängden styr penselns bredd. Hur brett isär du greppar styr symmetrin:
fingrarna ihop ger fri ritning, isär ger mandala. Greppa med shift, ctrl och
alt — de ligger i en egen byte i HID-protokollet och äter därför inte upp de
sex platserna.

Den färdiga teckningen spelas upp som ljud, och jämförs sedan med 177 länders
silhuetter för att avgöra vilket land du råkade rita.

---

## Öppna källor

Alla nyckellösa. Inga konton, inga spårare, ingen analys.

| | |
|---|---|
| Open-Meteo | väder, vind, höjd, luftkvalitet, soltider |
| Nominatim / OpenStreetMap | ortnamn och land |
| Wikimedia Commons | fotografi från platsen |
| Wikipedia | närmaste artikel, på svenska med engelska som reserv |
| iNaturalist | närmaste granskade artobservation |
| radio-browser.info | lokalradiostation, sökt på koordinat |
| Esri World Dark Gray | kartrutor |

Mapillary finns inbyggt för gatubilder och aktiveras med en gratisnyckel.

Och tiden visas i **Swatch Internet Time**, eftersom den saknar tidszoner. För
en tjänst vars hela uppgift är att kasta dig till en slumpmässig punkt på jorden
är det det enda tidsformat som inte behöver räknas om varje gång du landar.

---

## Teknik

Statisk sida utan byggsteg. Öppna filen, så kör den.

| | |
|---|---|
| Vanilla JavaScript | inga ramverk |
| MapLibre GL JS | kartan |
| Canvas 2D | konfettins partikelsystem |
| Web Audio | radioströmmen |
| Node:test | tester för väderlogiken, inga beroenden |

Landmasken som projektionen bygger på är förberäknad ur Natural Earth och
inbakad i sidan som 10,8 kB base64. Appen behöver alltså inget nätverk för att
veta var land finns.

```bash
python3 -m http.server 4173     # måste serveras över http, inte öppnas som fil
node --test test/urval.test.js  # 18 tester
```

---

## För granskning

Varje påstående nedan går att kontrollera på plats. Kör kommandona i repots rot.

```bash
# 5 · läser aldrig vilket tecken en tangent gör, bara var den sitter
grep -cE "\be\.key\b|event\.key" index.html                            # → 0
grep -oE "\be\.code\b" index.html | wc -l                              # → 5

# 5 · inga mus-, pek- eller tryckhändelser finns i gränssnittet
grep -cE "addEventListener\(.(click|mouse|pointer|touch)" index.html   # → 0

# 8 · inga API-nycklar i koden
grep -c "MAPILLARY_TOKEN = ''" index.html                              # → 1, tom sträng

# 6 · konfettins väderlogik är testad, inte påstådd
node --test test/urval.test.js                                         # → 18 av 18

# tjänsten är live
curl -so /dev/null -w "%{http_code}\n" https://tangentiellt.notini.se/ # → 200
```

| # | Påstående | Var |
|---|---|---|
| 5 | Bara tangentbord, aldrig mus | hela `index.html`, se kommandona ovan |
| 8 | Sju öppna källor, inga nycklar, inga konton, inga spårare | nio externa värdar totalt, alla listade ovan |
| 4 | Koordinat, karta, markör och osäkerhetscirkel per nedslag | avsnitt 2 i `index.html` |
| 6 | Konfettin är en avläsning av vädret, inte dekoration | `vader.js`, 192 rader ren logik utan DOM |
| 7 | Canvas, och användaren ritar själv | `#konfetti` samt [rita.html](https://tangentiellt.notini.se/rita.html) |

### Vad som inte är gjort

Briefens punkter 1, 2, 3 och 9 — 3D-gränssnitt, telefonstyrning via mikrofon
eller kamera, gyro, och parkoppling mellan enheter — finns inte i projektet.
Punkt 7, canvas, är uppfylld för konfettin och för
[Tangentbordspenseln](https://tangentiellt.notini.se/rita.html), men ritandet
ligger utanför huvudtjänsten.

Vi redovisar det hellre själva än låter en granskare hitta det.

---

## Mer

| | |
|---|---|
| [`DOCS/PRESENTATION.md`](DOCS/PRESENTATION.md) | berättelsen och ett demomanus |
| [`DOCS/ARKITEKTUR.md`](DOCS/ARKITEKTUR.md) | projektionen, inmatningsmotorn, datakällorna |
| [`DOCS/AGENTER.md`](DOCS/AGENTER.md) | konventioner och fällor för vidare utveckling |
