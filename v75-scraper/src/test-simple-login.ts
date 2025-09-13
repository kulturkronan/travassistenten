import { scrapeV75Simple } from "./simple-scraper.js";

async function testSimpleScraper() {
  try {
    console.log("Testar enkel V75-scraper med inloggning...");

    const v75Data = await scrapeV75Simple();

    console.log("Scraping lyckades!");
    console.log(`Datum: ${v75Data.date}`);
    console.log(`Bana: ${v75Data.track}`);
    console.log(`Antal avdelningar: ${v75Data.races.length}`);

    // Visa strukna hästar för varje avdelning
    v75Data.races.forEach((race: any) => {
      const scratchedHorses = race.horses.filter((h: any) => h.scratched);
      console.log(`\nAvdelning ${race.raceNumber}:`);
      console.log(`  Totalt ${race.horses.length} hästar`);
      console.log(`  Strukna hästar: ${scratchedHorses.length}`);
      if (scratchedHorses.length > 0) {
        console.log(
          `  Strukna: ${scratchedHorses.map((h: any) => h.number).join(", ")}`
        );
      }
    });
  } catch (error) {
    console.error("Fel vid scraping:", error);
  }
}

testSimpleScraper();
