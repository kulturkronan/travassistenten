# Web Scraping Notes för ATG Hästdata

## Problem

Den detaljerade hästhistoriken som visas i ATG:s webbgränssnitt (exakta datum, bannamn med spår, odds, prispengar) är inte tillgänglig via det öppna API:et.

## CSS-klasser som innehåller önskad data

Baserat på användarens information:

### Huvudhästdata

- `.horse-1v1fqyz-HorseTableRow-styles--extendedStartTableCell` - Bannamn med spår

### Hästhistorik-tabell

- `.horse-1ilk05f-PreviousStartsTable-styles--tableCellBody` - Distans : Spår (t.ex. "2640 : 3")

## Möjliga lösningar

### 1. Web Scraping med Playwright

```javascript
// Exempel på hur man skulle kunna skrapa data
const { chromium } = require("playwright");

async function scrapeHorseHistory() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Gå till hästsida
  await page.goto(
    "https://www.atg.se/spel/2025-06-01/vinnare/axevalla/lopp/4/resultat"
  );

  // Hitta hästhistorik-tabell
  const historyCells = await page.$$(
    ".horse-1ilk05f-PreviousStartsTable-styles--tableCellBody"
  );

  for (const cell of historyCells) {
    const text = await cell.textContent();
    // Extrahera "2640 : 3" format
    const distanceMatch = text.match(/(\d+) : (\d+)/);
    if (distanceMatch) {
      const distance = distanceMatch[1];
      const post = distanceMatch[2];
      console.log(`Distans: ${distance}, Spår: ${post}`);
    }
  }
}
```

### 2. Hybrid-lösning

- Använd API:et för grunddata (hästnamn, kusk, odds, etc.)
- Använd web scraping för detaljerad hästhistorik
- Kombinera data för komplett resultat

### 3. Begränsningar

- Web scraping är mer känsligt för ändringar i webbgränssnittet
- Kräver mer komplex kod
- Kan vara långsammare än API-anrop
- Kan kräva hantering av cookies/sessioner

## Rekommendation

För nu: Använd det öppna API:et med placeholders för saknad data.
För framtiden: Implementera web scraping för att få komplett hästhistorik.

## Aktuell lösning

Vi använder en hybrid-lösning som kombinerar:

### API-data (tillgängligt via öppna API:et)

- Grundläggande hästinfo (namn, ID, ålder)
- Odds och pools (V75%, V-odds, P-odds)
- Speltips och kommentarer per häst
- Ranking och analys

### Web scraping (kräver inloggning)

- Detaljerad formatering från webbgränssnittet
- Kompletta kommentarer och tips
- Bättre dataformat och presentation

### Begränsningar

- Web scraping kräver inloggning och är mer känsligt för ändringar
- "Senaste 5 starterna" med exakta datum och bannamn är fortfarande inte tillgängligt
- Vissa detaljer finns endast i webbgränssnittet

## ✅ LÖST! Web scraping fungerar perfekt

Vi har nu en fungerande lösning som kan hämta:

### Komplett "Senaste 5 starterna" data:

- **DATUM**: Fullständigt datum (YYYY-MM-DD)
- **BANA**: Bannamn med spår (t.ex. "Åby-9", "Jägersro-2")
- **KUSK**: Hela kusknamnet (t.ex. "Hanna Lähdekorpi")
- **PLAC**: Placering (0, 1, 2, 3, etc.)
- **DISTANS:SPÅR**: Exakt format (t.ex. "2140 : 6")
- **KM-TID**: Kilometertid (t.ex. "18,4g", "14,3a")
- **SKOR**: Skor (när tillgängligt)
- **ODDS**: Odds (t.ex. "9,08", "35,99")
- **PRIS**: Priskronor (t.ex. "60'", "125'")
- **VAGN**: Vagnstyp (t.ex. "Vanlig", "Amerikansk")
- **ANM**: Anmärkning (t.ex. "(m)")
- **VIDEO**: Video (när tillgängligt)
- **LOPPKOMMENTAR**: Kommentarer (kräver inloggning)

### Nästa steg:

Integrera web scraping med API:et för att skapa komplett startlista med all hästhistorik.
