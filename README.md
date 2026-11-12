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
| **7** | Canvas | Konfettin ritas på canvas. Att *användaren* ritar finns i sidospåren `rita.html` och `doodle.html`, inte i huvudtjänsten. |

Inte gjort: 3D-gränssnitt, telefonstyrning med mikrofon, kamera eller gyro,
samt parkoppling mellan enheter.

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

## Mer

| | |
|---|---|
| [`DOCS/PRESENTATION.md`](DOCS/PRESENTATION.md) | berättelsen och ett demomanus |
| [`DOCS/ARKITEKTUR.md`](DOCS/ARKITEKTUR.md) | projektionen, inmatningsmotorn, datakällorna |
| [`DOCS/AGENTER.md`](DOCS/AGENTER.md) | konventioner och fällor för vidare utveckling |
