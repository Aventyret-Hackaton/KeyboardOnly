# Arkitektur

`index.html` är hela appen — ungefär 1 280 rader i en fil, uppdelad i numrerade
avsnitt. Inget byggsteg, inga beroenden utom MapLibre från CDN.

| avsnitt | innehåll |
|---|---|
| 1 | Fysisk tangentbordslayout |
| 1b | Landmask och projektion |
| 2 | Kartan |
| 3 | Tangentbords-HUD |
| 4 | Inmatningsmotorn |
| 5 | Låsning och domen |
| 6 | De öppna API:erna — ort, väder, artikel |
| 7 | Bilden |
| 8 | Höjd, sol, luft, seismik, arter, musik |
| 9 | Konfetti |
| 10 | Radion |
| 11 | Tiden |

---

## 1 · Från tangentbord till koordinat

### Tangenternas positioner

Två tabeller med `[code, x, y, bredd, höjd]` i tangentenheter. MacBook ISO är
standard, `?kb=full` ger det fullstora bordet.

MacBook-tabellen är **inte** en avkapad fullstor tabell. Bottenraden har andra
bredder, piltangenterna ligger inne i bokstavsblocket med halvhöga upp och ner,
funktionsraden är halvhög, och ISO lägger en extra tangent vid vänster shift
(`IntlBackslash`) samtidigt som returtangenten blir två rader hög.

### Projektionen

Haven är bortvridna. Varje tangent täcker lika mycket **land**, inte lika mycket
jordyta.

1. En landmask från Natural Earth 110m, rastrerad till 360 × 180 rutor och
   inbakad i filen som base64 (10,8 kB).
2. Varje ruta vägs med `cos(lat)` — en ruta på 1° × 1° vid 80:e breddgraden är
   en sjättedel så stor som en vid ekvatorn. Utan den viktningen äter Antarktis
   och Sibirien en fjärdedel av tangentbordet.
3. Två **globala** fördelningsfunktioner byggs: landarea per längdgrad och per
   breddgrad. Tangentbordets x går genom den ena, y genom den andra.
4. Svansarna trimmas med `P_LO = 0.03` och `P_HI = 0.90`. Utan det blir översta
   raden Nordpolen och nedersta Sydpolen — två bortkastade rader. `P_HI` strax
   under 0,91 kastar ut Antarktis, som är ungefär nio procent av jordens land.
5. Paret kan ändå peka i vatten. Då söker `snapToLand()` utåt i ringar till
   närmaste landruta och kliver en bit tillbaka mot ursprungspunkten, så att
   resultatet inte blir en rutmittpunkt på exakt `.5000` grader.

**Fördelningarna måste vara globala.** Första versionen gjorde latituden
betingad per längdgradskolumn, vilket sträckte varje kolumn över precis det land
som råkade finnas där. Vid 12°Ö gick det då direkt från 80°N till 31°N — hela
Europa låg i glappet mellan två tangentrader. Samma rad betydde dessutom olika
breddgrader på olika ställen i sidled.

Resultatet nu, per rad på en MacBook:

| rad | breddgrad |
|---|---|
| siffror | 70°N |
| QWERTY | 48°N |
| hemrad | 29°N |
| ZXCV | 6°N |
| botten | −25° |

`?raw` stänger av hela vridningen och visar den råa projektionen.

---

## 2 · Inmatningsmotorn

En `setInterval` på 50 ms. Tre tal uppdateras varje tick:

```js
intensity = intensity * DECAY_I + hits + down.size * HELD_W;
```

**Rörelse, inte tyngd.** USB-tangentbord rapporterar högst sex samtidiga
tangenter — 6-key rollover. Lägger du handflatan på tangentbordet skickas sex,
resten tigs ihjäl. Därför mäts färska nedslag med avklingning, inte hur många som
hålls nere. Modifierartangenterna ligger i en egen byte i HID-protokollet och
räknas **inte** mot sexan.

**Tyngdpunkten** är ett avklingande viktat medelvärde av de berörda tangenternas
positioner. `DECAY_C = 0.80` — högre värden ger eftersläpning, så att pennan inte
hinner fram dit du sveper.

**Låsningen** sker när intensiteten legat under `CALM` i `CALM_T` tick, alltså
600 ms stillhet.

**Funktionsraden är avstängd.** `FN_ROW_WORKS = false`, eftersom macOS äter
F1–F12 när "Use F1, F2, etc. keys as standard function keys" är av. De skickar
aldrig någon tangenthändelse till sidan. Med `false` spänns breddgraderna över
sifferraden till bottenraden i stället, så alla fem användbara rader får varsitt
band. Sätt `true` om `defaults write -g com.apple.keyboard.fnState -bool true`
är körd och maskinen omstartad.

---

## 3 · Datakällorna

Alla nyckellösa utom Mapillary. Alla parallella. Kortet står uppe från början och
varje källa fyller sin egen ruta när den svarar.

| vad | källa |
|---|---|
| kartrutor | Esri World Dark Gray |
| ort och land | Nominatim |
| väder, vind, sol, höjd, luft | Open-Meteo (tre endpoints) |
| artikel | Wikipedia geosearch, sv + en |
| foto | Mapillary om nyckel finns, annars Wikimedia Commons |
| seismik | USGS |
| arter | iNaturalist |
| musik | MusicBrainz |
| radio | radio-browser.info |

### Ringmönstret

Tre av källorna — Commons, Wikipedia och radio — har en radiegräns på 10 km
respektive en gles träffbild. Alla tre använder samma lösning: **vidgande ringar
av frågepunkter** runt landningspunkten, parallellt per ring, avbryt så fort
något hittas, och räkna avståndet till den egna landningspunkten och inte till
frågepunkten.

```js
const RINGAR = [[0, 1], [25, 6], [60, 6], [140, 8]];   // radie i km, antal punkter
```

Wikipedia gick från 3 träffar på 15 svep till 12 av 15 med det här mönstret.
Återanvänd det om du lägger till en fjärde källa med samma problem.

### Mapillary

Kräver en gratisnyckel: mapillary.com → Developers → Register application.
Klistra in i `MAPILLARY_TOKEN`. Är strängen tom hoppas den över helt och Commons
tar vid, så appen fungerar utan.

---

## 4 · Konfettin

Egen duk överst med `pointer-events:none`. Slingan startar bara när det finns
partiklar eller när regnet är på, och stannar själv — den kostar ingenting mellan
svepen.

**Vinden styr den.** Open-Meteo ger fart och riktning. Meteorologisk vindriktning
anger varifrån det blåser, så vektorn måste vändas: en vind från väst (270°)
skjuter konfettin österut, alltså åt höger på skärmen.

Regnbitarna får kraftigt luftmotstånd i höjdled så de dalar i stället för att
störta, och **ingen egen fart i sidled** — allt som rör dem horisontellt är
vinden. Det är hela poängen med regnet. Sidledes motstånd lämnas lågt, annars
dämpas vinden bort.

Mätt med regn plus full salva: 455 partiklar, 8,3 ms per bildruta i median.

---

## 5 · Tiden

Swatch Internet Time. Dygnet delas i 1 000 beats om 86,4 sekunder, räknat från
midnatt i Biel Mean Time — UTC+1, aldrig sommartid.

```js
const bmt = d.getTime() + 3600000;
beats = Math.floor((bmt % 86400000) / 86400);
```

Kontrollerat mot specifikationens gränser: beat 248 börjar 05:57:07,2 BMT, och
den sista beaten på dygnet är 999.

---

## 6 · Datafilerna och hur de görs om

De tre JSON-filerna är förbakade. **Skripten som skapade dem finns inte i
repot** — de låg i en tillfällig arbetskatalog. Så här gjordes de:

### `rutnat.json` — 1440 × 720 landsrutnät

Källa: `ne_50m_admin_0_countries.geojson` från
`github.com/nvkelso/natural-earth-vector`.

Rastrerat med scanline-fyllning till 0,25°-rutor där varje ruta får landets
index, 255 för hav. Längdkodat, vilket krymper det från 1 MB till 102 kB
eftersom haven är långa sammanhängande sjok.

En ruta räknas som land först när dess **mittpunkt** ligger innanför gränsen, så
kustnära punkter som Stockholm hamnar i havsrutor. Uppslagningen snäppar därför
utåt tre rutor innan den ger upp.

### `lander.json` — silhuetter och formsignaturer

Källa: `ne_110m_admin_0_countries.geojson`.

Per land tas den **största polygonen** — Natural Earth delar vid datumgränsen, så
annars spänner Rysslands omslutande rektangel hela jordklotet. Longituden
korrigeras med `cos(medelbreddgrad)` så att Ryssland inte blir absurt brett.
Sedan en radiell signatur med 64 sektorer plus en omsamplad kontur.

### `kurvor.json` — 6 302 tidsserier

Källa: Världsbankens API, 36 indikatorer över 8 ämnen och 216 länder.

Normaliserade till 40 punkter i spannet 0–255, base64-kodade, med
uppslagstabeller för indikator- och landsnamn. Indikatornamnen är
handöversatta till svenska i byggskriptet.

**Obs:** Världsbankens API går inte att nå från webbläsaren, men svarar fint på
`curl`. Därför måste korpusen byggas i skalet, inte i appen.

Landskoderna skiljer sig mellan endpoints: indikatorsvaret använder
tvåbokstavskoder och landlistan trebokstavs. Det kostade en felsökningsrunda.
