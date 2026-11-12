# För den som utvecklar vidare

Skrivet för både människor och agenter. Innehåller de saker som kostade tid att
lista ut och som inte syns i koden.

---

## Den redaktionella regeln

**Varje påstående appen gör ska vara sant men meningslöst.**

"149 miljoner km² täckning" stämmer. "Inga konton, inga spårare" stämmer.
"Säkerhet 84,4 %" är ett påhittat mått, men formeln är verklig och
reproducerbar. Att produkten inte gör någon nytta framgår av sig självt.

**Blinka aldrig åt publiken.** Skriv aldrig något i stil med "används av noll
organisationer". I samma sekund texten pekar på skämtet blir det en parodi, och
en parodi är sämre än en tjänst. Håll rak min i all gränssnittstext.

Det här är inte en stilpreferens utan den enda regel som håller ihop projektet.
Allt annat går att ändra.

---

## Fällan som kommer lura dig

**`requestAnimationFrame` står still när webbläsarfönstret inte ritas.**

Om du driver appen genom ett automatiserat webbläsarfönster som är dolt eller
inte målas, så fryser allt som hänger på rAF — medan dina `setTimeout` tickar
vidare som om inget hänt. Det ger diagnoser som ser helt övertygande ut och är
helt fel.

Under bygget orsakade det tre falska slutsatser:

| symptom | vad jag trodde | vad det var |
|---|---|---|
| kartan blev aldrig klar | CARTO hade lagt om sin stil | rAF frusen, `load` avfyrades aldrig |
| `fitBounds` gjorde ingenting | buggig padding | animationen tickade aldrig |
| ritloopen ritade inget | trasig inmatning | 150 nedslag hopades till en enda bildruta |

Tecknet att leta efter: **identiska värden över flera mätpunkter**. Står
`intensity` på exakt samma decimal tre gånger i rad, då snurrar inte loopen.

Så här testar du runt det:

- Ta en skärmbild mellan stegen — den tvingar fram omritning.
- Anropa funktionerna direkt (`lock()`, `analysera()`) i stället för att vänta
  på att loopen ska nå dit.
- Sätt `element.style.transition = 'none'` innan du läser av sluttillstånd, för
  CSS-övergångar fryser likadant.
- Mät funktionen, inte flödet: testa `toLngLat()` mot kända punkter i stället
  för att svepa.

**Och städa upp efter dig.** Ett test som anropar `lock()` startar radion. Kör
`stoppaRadio()` och stäng fliken när du är klar — annars sitter någon och lyssnar
på galicisk lokalradio utan att veta varför.

---

## Plattformsfakta som styr designen

**`event.code`, aldrig `event.key`.** `code` är den fysiska tangentens position,
oberoende av språk och layout. Hela projektets premiss vilar på det.

**6-key rollover.** USB-tangentbord rapporterar högst sex samtidiga tangenter.
Mät rörelse över tid, inte hur många som hålls nere. Modifierarna ligger i en
egen byte och räknas inte mot sexan — det är därför de är bra greppfingrar.

**macOS äter F1–F12** när `fnState` är av. De skickar inga events alls. Det går
inte att stänga av från en webbsida; `navigator.keyboard.getLayoutMap()` ger
bara vilket tecken varje tangent gör, aldrig geometrin.

**`Fn` och `Caps Lock`** går inte att lita på. Fn skickar ingenting, Caps Lock
beter sig som en växel med halva events.

**`audio.src = ''` släpper inte strömmen.** Tom sträng löses upp mot sidans egen
adress, så elementet börjar ladda `index.html` som media. Använd
`removeAttribute('src')` följt av `load()`. Spåra dessutom varje skapat
ljudelement i en mängd — bara den senaste variabeln räcker inte, och ett
element som ingen längre pekar på går inte att stoppa.

---

## Datakällornas status

| källa | status |
|---|---|
| Open-Meteo (3 endpoints) | snabb och pålitlig, ~150 ms |
| Nominatim | fungerar, ett anrop i sekunden |
| Wikipedia / Commons geosearch | fungerar, **10 km radiegräns** |
| USGS | snabb |
| iNaturalist | fungerar |
| radio-browser.info | nyckellös, CORS-öppen, ~250 ms |
| Esri kartrutor | nyckellösa |
| MusicBrainz | **ungefär ett anrop i sekunden**, svarar annars utan `artists`-fält |
| Mapillary | kräver gratisnyckel |
| CARTO | **kräver numera nyckel**, även för rasterkakel |
| restcountries.com | **CORS, går inte från webbläsare** |
| GDELT (nyheter) | **CORS, går inte från webbläsare** |
| Världsbanken | **går inte från webbläsare**, men svarar på `curl` |

Lägger du till en källa: testa CORS från webbläsaren *först*. Tre av källorna
ovan såg perfekta ut i dokumentationen och föll på CORS.

### Ringmönstret

Har den nya källan en radiegräns eller gles täckning, återanvänd mönstret från
`visaFoto()`, `article()` och `sokStation()`: vidgande ringar av frågepunkter,
parallellt per ring, avbryt vid första träff, och mät avståndet till
landningspunkten — inte till frågepunkten.

---

## Konventioner

**En fil, inget byggsteg.** `index.html` innehåller allt utom MapLibre.
Behåll det. Demon ska inte kunna falla på en saknad beroendeinstallation.

**Numrerade avsnitt** med en rubrikkommentar som förklarar *varför*, inte vad.

**Namngivna konstanter med kommentar.** Varje magiskt tal som någon kan vilja
skruva på ska ha ett namn och en rad om vad som händer när man ändrar det.
`GRIP_MS`, `P_HI`, `REGN_TAKT`, `MAPILLARY_TOKEN` är exempel.

**Svenska i kommentarer och gränssnitt.**

**Inga nycklar i koden.** `MAPILLARY_TOKEN` är tom i repot och ska förbli det.

**Allt som kan misslyckas ska ha ett vettigt svar.** "Ingen har fotograferat
här" är bättre än en tom ruta, och "fick inget svar" är bättre än att låtsas att
landet saknar band.

---

## Verifiering

Mät, gissa inte. Det som fungerat bra:

| vad | hur |
|---|---|
| projektionen | kör alla tangenter genom `toLngLat()` och räkna hur många som hamnar i vatten — ska vara noll |
| en ny källa | 15 slumpvisa landningspunkter, räkna träffar |
| prestanda | samla `requestAnimationFrame`-deltan och ta medianen |
| tidsberäkning | testa på gränserna, inte i mitten |
| ljudnedstängning | skapa flera element, stoppa, kontrollera att `src` är borta på alla |

---

## Vilande filer

`rita.html`, `doodle.html` och `spel.html` är avslutade experiment. De fungerar
men ingår inte i Tangent, och de har en äldre tangentbordstabell utan
MacBook-stöd.

**Uppdatera dem inte oombedd.** De ligger kvar för att vi kanske återvänder till
något av spåren, inte för att de ska hållas aktuella.

`index-utan-bild.html` är en säkerhetskopia från innan git fanns i projektet och
kan tas bort.
