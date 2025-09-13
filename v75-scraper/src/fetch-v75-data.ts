import { chromium, Browser, Page } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface Horse {
  number: number;
  name: string;
  driver: string;
  track: number;
  record: string;
  prizeMoney: number;
  v75Percent: number;
  trendPercent: number;
  vOdds: number;
  pOdds: number;
  shoes: string;
  wagon: string;
  scratched: boolean;
}

interface V75Race {
  raceNumber: number;
  title: string;
  distance: string;
  trackType: string;
  horses: Horse[];
}

async function fetchV75Data(baseUrl: string): Promise<V75Race[]> {
  let browser: Browser | null = null;

  try {
    console.log("🚀 Startar Playwright för att hämta V75-data...");

    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Sätt User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const allRaces: V75Race[] = [];

    // Hämta alla 7 avdelningar
    for (let i = 1; i <= 7; i++) {
      try {
        console.log(`🔄 Hämtar avdelning ${i}...`);

        const url = `${baseUrl}/avd/${i}`;
        console.log(`📍 URL: ${url}`);

        await page.goto(url, { waitUntil: "networkidle" });

        // Vänta lite för att säkerställa att sidan laddas
        await page.waitForTimeout(2000);

        // Extrahera hästdata från sidan
        const horses = await page.evaluate(() => {
          const horseElements = document.querySelectorAll(
            "tr, .horse-row, [data-horse-id]"
          );
          const horses: any[] = [];

          horseElements.forEach((element, index) => {
            const text = element.textContent || "";

            // Sök efter hästnamn och kusk
            const nameMatch = text.match(
              /([A-ZÅÄÖ][a-zåäö\s]+[A-ZÅÄÖ][a-zåäö]+)/
            );
            if (nameMatch) {
              const name = nameMatch[1].trim();
              const driver = `Kusk ${index + 1}`;

              // Sök efter V75%
              const v75Match = text.match(/(\d+(?:,\d+)?)%/);
              const v75Percent = v75Match
                ? parseFloat(v75Match[1].replace(",", "."))
                : 0;

              // Sök efter odds
              const oddsMatch = text.match(/(\d+(?:,\d+)?)/);
              const vOdds = oddsMatch
                ? parseFloat(oddsMatch[1].replace(",", "."))
                : 0;

              // Kolla om struken
              const isScratched =
                text.includes("struken") || text.includes("JA");

              if (
                name.length > 3 &&
                name.length < 30 &&
                !name.includes("V75")
              ) {
                horses.push({
                  number: index + 1,
                  name: name,
                  driver: driver,
                  track: index + 1,
                  record: "0.00,0",
                  prizeMoney: 0,
                  v75Percent: isScratched ? 0 : v75Percent,
                  trendPercent: 0,
                  vOdds: isScratched ? 99.99 : vOdds,
                  pOdds: isScratched ? 99.99 : vOdds,
                  shoes: "CC",
                  wagon: "Vanlig",
                  scratched: isScratched,
                });
              }
            }
          });

          return horses;
        });

        if (horses.length > 0) {
          allRaces.push({
            raceNumber: i,
            title: `V75-${i} - Bjerke`,
            distance: "2100m",
            trackType: "V75",
            horses: horses,
          });

          console.log(`✅ Avdelning ${i}: ${horses.length} hästar`);
        } else {
          console.log(`⚠️ Avdelning ${i}: Inga hästar hittades`);
        }
      } catch (error) {
        console.error(`❌ Fel vid hämtning av avdelning ${i}:`, error);
      }
    }

    console.log(`✅ Totalt hämtade ${allRaces.length} avdelningar`);
    return allRaces;
  } catch (error) {
    console.error("❌ Fel vid Playwright-hämtning:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Huvudfunktion
async function main() {
  const baseUrl =
    process.argv[2] || "https://www.atg.se/spel/2025-09-14/V75/bjerke";

  try {
    const races = await fetchV75Data(baseUrl);

    // Spara resultatet till fil
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const resultPath = path.join(__dirname, "..", "v75-data.json");

    fs.writeFileSync(resultPath, JSON.stringify(races, null, 2));
    console.log(`✅ Data sparad till ${resultPath}`);
  } catch (error) {
    console.error("❌ Fel:", error);
    process.exit(1);
  }
}

// Kör endast om detta är huvudfilen
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fetchV75Data };
