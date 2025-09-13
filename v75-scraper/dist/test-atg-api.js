import { scrapeATGAPI } from "./atg-api-scraper.js";
async function testATGAPI() {
    try {
        console.log("Testar ATG API-scraper...");
        const v75Data = await scrapeATGAPI();
        console.log("Scraping lyckades!");
        console.log(`Datum: ${v75Data.date}`);
        console.log(`Bana: ${v75Data.track}`);
        console.log(`Antal avdelningar: ${v75Data.races.length}`);
        // Visa första avdelningen
        if (v75Data.races.length > 0) {
            const firstRace = v75Data.races[0];
            console.log(`\nFörsta avdelningen: ${firstRace.title}`);
            console.log(`Antal hästar: ${firstRace.horses.length}`);
            // Visa första 5 hästarna
            firstRace.horses.slice(0, 5).forEach((horse) => {
                console.log(`  ${horse.number}. ${horse.name} - ${horse.driver}`);
            });
        }
    }
    catch (error) {
        console.error("Fel vid ATG API-scraping:", error);
    }
}
testATGAPI();
//# sourceMappingURL=test-atg-api.js.map