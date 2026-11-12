# Tangent

*Precisionspositionering utan pekdon.*

Du lägger händerna på tangentbordet och sveper. Tyngdpunkten av det du rör vid
blir en koordinat på jorden, och appen berättar vad som finns där: ort, väder,
ett fotografi, närmaste Wikipedia-artikel, närmaste observerade art, det
kraftigaste jordskalvet i närheten, och lokalradion som sänder därifrån just nu.

Konfettin som faller över skärmen är en avläsning av vädret på platsen — vinden
styr driften, och de tre mest talande förhållandena styr fall, färg, täthet,
djup och ljus.

Positionen har inget som helst samband med var du faktiskt befinner dig.

---

## Kom igång

```bash
cd /Users/hnotini/htdocs/konferens
python3 -m http.server 4173
```

Öppna `http://localhost:4173/` och lägg händerna på tangentbordet.

Appen **måste serveras över http**. Öppnar du filen direkt som `file://` får
sidan ursprunget `null`, och då nekar Nominatim, Wikipedia och Commons anropen.

### Parametrar i adressen

| parameter | effekt |
|---|---|
| `?kb=full` | fullstort Apple-tangentbord i stället för MacBook |
| `?raw` | rå, ovriden projektion — två tredjedelar hav |

### Tester

```bash
node --test test/urval.test.js
```

Inga beroenden — node:test räcker.

### Tangenter

| | |
|---|---|
| vilken tangent som helst | lämnar startskärmen |
| svep, rulla, trumma | placerar positionen |
| `Cmd+M` | tystar radion |
| `Cmd+R` | laddar om |

### Publicera på webben

Appen är statisk och har inget byggsteg, så GitHub Pages räcker:
**Settings → Pages → Deploy from a branch → `main` / `(root)`**. Alla sökvägar
är relativa, så den fungerar även på en underkatalog.

Två saker att veta innan:

- **Radiostationer över http filtreras bort** på en https-sida, eftersom
  webbläsaren annars blockerar dem tyst. Ungefär 15 procent av stationerna
  berörs. Filtret sitter i `sokStation()` och slår bara till när sidan själv
  körs över https.
- **Nominatims villkor** kräver en identifierbar klient och högst ett anrop i
  sekunden. En webbläsare kan inte sätta User-Agent, så en publik sida som får
  trafik riskerar att blockeras. För en demo du själv kör är det oproblematiskt.

---

## Filkarta

### Appen

| fil | roll |
|---|---|
| `index.html` | **Tangent.** Allt som rör DOM, canvas och nätverk. Landmasken ligger inbakad som base64, så den behöver inga lokala datafiler. |
| `vader.js` | Ren logik för väderkonfettin — vilka tre förhållanden som visas och hur de ser ut. Utan DOM och nätverk, så den går att testa. |
| `test/urval.test.js` | 18 tester för urvalslogiken. |
| `index-utan-bild.html` | Säkerhetskopia från innan bildpanelen byggdes. Kan tas bort nu när git finns. |

Inget byggsteg. `vader.js` laddas som ett vanligt `<script src>`.

### Datafiler

| fil | storlek | används av |
|---|---|---|
| `rutnat.json` | 102 kB | `spel.html` — landsuppslag per koordinat |
| `lander.json` | 213 kB | `rita.html` — landssilhuetter |
| `kurvor.json` | 574 kB | `doodle.html` — 6 302 tidsserier |

`index.html` använder **ingen** av dem. Se `ARKITEKTUR.md` för hur de görs om.

### Vilande experiment

Tre spår vi provade och lämnade. De fungerar, men ingår inte i Tangent.

| fil | vad det är |
|---|---|
| `rita.html` | Tangentbordet som pensel. Fingerantal väljer färg, intensitet bredd, greppets spridning symmetri. Bilden spelas upp som ljud, och matchas mot 177 länders silhuetter. |
| `doodle.html` | Etch-a-Sketch. Halvorna är två rattar. Linjen läses som en graf och matchas mot Världsbankens tidsserier. |
| `spel.html` | Dagens land ur USGS jordskalvsflöde, som du ska placera på kartan på högst fem försök. |

De använder en äldre version av tangentbordstabellen och har inte följt med
senare ändringar.

---

## Dokumenten

| | |
|---|---|
| `PRESENTATION.md` | Berättelsen, argumenten och ett demomanus |
| `ARKITEKTUR.md` | Hur projektionen, inmatningen och datakällorna fungerar |
| `AGENTER.md` | Konventioner och fällor för den som utvecklar vidare |
