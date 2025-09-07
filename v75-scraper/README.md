# V75 Scraper

En TypeScript-baserad scraper för att hämta V75-startlistor från ATG och skriva dem till Excel.

## Funktioner

- Scrapar V75-startlistor från ATG.se
- Extraherar hästdata: namn, nummer, kusk, tränare, V75%, trend, odds
- Intelligent skor-extraktion med normalisering (cc, c̶c, cc̶, c̶c̶)
- Skriver direkt till Excel-mall med flikar för Avd1-Avd7
- Robust felhantering och retry-logik
- TypeScript med Zod-validering

## Installation

```bash
# Installera dependencies
pnpm install

# Installera Playwright Chromium
pnpm dlx playwright install chromium
```

## Användning

```bash
# Kör scrapern
pnpm dev --date 2025-09-06 --track V75 --bane jagersro

# Eller bygg och kör
pnpm build
pnpm start --date 2025-09-06 --track V75 --bane jagersro
```

### Argument

- `--date`: Datum i format YYYY-MM-DD (t.ex. 2025-09-06)
- `--track`: Speltyp (t.ex. V75)
- `--bane`: Bana (t.ex. jagersro) - valfritt

## Projektstruktur

```
src/
├── fetch.ts           # Huvudscraper
├── schemas.ts         # Zod-scheman för validering
├── shoeNormalizer.ts  # Skor-normalisering
└── excelWriter.ts     # Excel-skrivning
```

## Skor-normalisering

Scrapern mappar ATG:s skor-text till standardiserade format:

- "Barfota fram, Skor bak" → `c̶c`
- "Skor fram, Barfota bak" → `cc̶`
- "Barfota runt om" → `c̶c̶`
- "Skor runt om" → `cc`

## Excel-utdata

Skapar/uppdaterar `V75_UtokadStartlista_Mall.xlsx` med flikar:

- Avd1, Avd2, ..., Avd7
- Kolumner: Hästnamn, Nr, Kusk, Tränare, V75%, Trend, Odds, Skor

## Utveckling

```bash
# Utvecklingsläge med hot reload
pnpm dev

# Bygg projektet
pnpm build

# Kör tester (om implementerade)
pnpm test
```

## Felsökning

Scrapern använder flera fallback-selektorer för att hitta hästdata. Om vissa hästar inte hittas, kontrollera:

1. ATG:s HTML-struktur har inte ändrats
2. Nätverksanslutning är stabil
3. Sidan laddas korrekt i browser

Loggar visar vilka selektorer som används och eventuella fel.
