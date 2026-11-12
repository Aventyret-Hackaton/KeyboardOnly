# Brief: Stupid Hackathon

Originalet finns som foto i `BRIEF-bonustekniker.jpg`. PDF:en `Stupid-hackaton.pdf`
ligger kvar i Downloads, saknas här än så länge.

## Bonustekniker, 1 poäng per extra teknik

1. 3D-drivet gränssnitt (WebGL, GSAP, Three.js etc.)
2. Styr gränssnittet med telefonen, minus skärmen! (mikrofon, kamera)
3. Styr gränssnittet med telefonen, minus skärmen! (gyro)
4. Geolokalisering / karta med markörer / Mapbox etc.
5. Aldrig mus, bara tangentbord
6. Konfetti: everytime, all the time!
7. Canvas (användaren ritar på skärmen)
8. Data från ett öppet API, t.ex. väder eller kollektivtrafik
9. Parkoppling / igenkänning av andra enheter inom rumslig distansdimension

## Var Tangentiellt står i dag

| # | Teknik | Status | Var |
|---|---|---|---|
| 4 | Geolokalisering / karta | Ja, koordinat på jorden + kartbild | `index.html` |
| 5 | Bara tangentbord | Ja, det är hela idén | `index.html` |
| 7 | Canvas | Delvis. Canvas finns i `index.html`; ritande användare finns i `rita.html` och `doodle.html` | |
| 8 | Öppet API | Ja, nio källor (Open-Meteo, Wikipedia, Commons, USGS m.fl.) | `index.html` |
| 6 | Konfetti | Ja, väderkonfetti | `index.html`, `vader.js` |
| 1, 2, 3, 9 | 3D, telefon, gyro, parkoppling | Nej | |

Status är en snabb kodsökning, inte en genomgång. Stäm av innan ni räknar poäng.
