# Presentationsunderlag

## Kärnan, på trettio sekunder

> Vi fick bara använda tangentbordet. Så vi slutade använda det som ett
> tangentbord.
>
> Tangent bryr sig inte om vilka tecken tangenterna gör. Den bryr sig om *var de
> sitter*. Lägg handen på tangentbordet, så blir handens tyngdpunkt en punkt på
> jorden — och vi berättar allt vi kan hitta om den punkten.

---

## Den tekniska pointen som bär allt

Webbläsaren ger två olika saker för samma tangenttryck:

| | |
|---|---|
| `event.key` | vilket **tecken** tangenten gör — ändras med språk och layout |
| `event.code` | vilken **fysisk tangent** det är — oberoende av allt |

Hela utmaningen var att frångå tangenternas innebörd och använda tangentbordets
fysiska egenskaper. Det är exakt skillnaden mellan de två fälten. Vi använder
bara `event.code`, aldrig `event.key`.

Det är en bra sak att säga tidigt, för det visar att begränsningen inte är
påklistrad utan att den har en direkt motsvarighet i plattformen.

---

## Argumenten, i den ordning de håller

**1. Tangentbordet är en yta, inte en uppsättning kommandon.**
104 tangenter med kända fysiska positioner är en inmatningsenhet med upplösning.
Vi använder den som ett ritbord.

**2. Haven är bortvridna.**
En rak projektion hade gjort två tredjedelar av tangentbordet till Stilla havet.
Vi vred i stället projektionen så att varje tangent täcker lika mycket *land*.
Alla 78 tangenter på en MacBook landar på land. Det är en riktig
kartprojektionsfråga som vi löste på riktigt — för en helt onödig sak.

**3. Nio öppna datakällor, inga nycklar, inga konton.**
Allt som visas kommer från öppna API:er som vem som helst kan anropa.

**4. Tiden visas i beats.**
Swatch Internet Time har inga tidszoner. För en tjänst vars hela uppgift är att
kasta dig till en slumpmässig punkt på jorden är det det enda tidsformat som inte
behöver räknas om varje gång du landar. Argumentet håller. Det är därför det är
roligt.

---

## Demomanus

Räkna med två till tre minuter. Kör i egen webbläsare, fullskärm, med ljudet på.

**1 · Startskärmen.** Låt den stå kvar några sekunder. Läs tre påståenden högt.
Påpeka att alla tre är sanna.

**2 · Första svepet.** Lägg båda händerna på tangentbordet och rulla. Peka på
intensitetsmätaren medan du gör det. Säg att det inte finns något kommando, bara
rörelse.

**3 · Låsningen.** Konfettin smäller, kortet kommer upp, kartan zoomar in.
Läs ortnamnet. Det blir nästan alltid ett ställe ingen i rummet hört talas om.

**4 · Bilden.** Vänta ut den. Det är här det vänder från demo till plats.

**5 · Radion.** Låt den spela några sekunder utan att säga något. Det är ofta
den starkaste punkten i hela demonstrationen — att faktiskt höra vad de lyssnar
på just nu, på andra sidan jorden, för att någon slog handflatan i ett
tangentbord.

**6 · Konfettiregnet.** Peka på vindraden på väderkortet, peka sedan på
konfettin. Den blåser åt samma håll med samma styrka. Datan är läsbar i rummet.

**7 · Ett svep till.** Visa att det byter plats, byter station, byter väder.

### Om du bara får en minut

Hoppa över startskärmen. Svep, vänta ut bilden och radion, peka på vinden.
Det är de tre sakerna som landar.

### Om något går fel

| | |
|---|---|
| ingen bild | Säg "ingen har fotograferat där" — det är ett bättre svar |
| ingen radio | Sveppa om, det tar två sekunder |
| tom artistrad | MusicBrainz släpper ett anrop i sekunden, sveppa om |
| kartan svart | ladda om; kakelleverantören är det enda externa som kan fälla vyn |

---

## Siffror värda att citera

| | |
|---|---|
| 149 miljoner km² | landyta, tillgänglig från första svepet |
| 78 tangenter | på en MacBook, **noll** i vatten |
| 6 av 6 | platser i vårt test fick en lokalradiostation |
| 12 av 15 | svep hittade en Wikipedia-artikel |
| 9 | öppna datakällor, noll API-nycklar |
| 1 000 | beats per dygn, inga tidszoner |

---

## Tonläge — det här är det viktigaste

**Påståendena ska vara sanna men meningslösa.** "149 miljoner km² täckning"
stämmer. "Inga konton, inga spårare" stämmer. "Noll inlärningstid" stämmer.
Att produkten inte gör någon nytta framgår av sig självt.

**Blinka aldrig åt publiken.** Vi skrev aldrig "används av noll organisationer"
eller något liknande. I samma sekund som vi pekar på skämtet blir det en parodi,
och en parodi är sämre än en tjänst. Håll rak min hela vägen.

**Låt felmarginalen vara kvar.** "Säkerhet 84,4 % · felmarginal ± 66 km" är
kärnan: tvärsäker precision om ingenting alls.
