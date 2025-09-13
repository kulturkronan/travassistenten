import { loginToATG } from "./login.js";
export async function scrapeV75Simple() {
    console.log("Startar enkel V75-scraping med inloggning...");
    // Steg 1: Logga in och få cookies
    const loginResult = await loginToATG();
    if (!loginResult.success) {
        throw new Error(`Inloggning misslyckades: ${loginResult.error}`);
    }
    console.log("Inloggning lyckades, hämtar V75-data...");
    // Steg 2: Använd cookies för att hämta V75-sidan
    try {
        const response = await fetch("https://www.atg.se/spel/v75", {
            headers: {
                Cookie: loginResult.cookies,
                "User-Agent": loginResult.userAgent,
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const html = await response.text();
        console.log(`Hämtade ${html.length} tecken HTML från V75-sidan`);
        // Steg 3: Parsa HTML för att hitta strukna hästar och odds
        const races = parseV75HTML(html);
        return {
            date: "2025-09-13",
            track: "Bollnäs",
            races: races,
        };
    }
    catch (error) {
        console.error("Fel vid hämtning av V75-data:", error);
        throw error;
    }
}
function parseV75HTML(html) {
    const races = [];
    // Enkel regex-baserad parsing för att hitta strukna hästar
    // Detta är en förenklad version - i en riktig implementation skulle vi använda en HTML parser
    // Hitta avdelningar
    const divisionRegex = /avdelning\s+(\d+)/gi;
    const divisions = [...html.matchAll(divisionRegex)];
    console.log(`Hittade ${divisions.length} avdelningar i HTML`);
    // För varje avdelning, hitta strukna hästar
    for (let i = 0; i < Math.min(divisions.length, 7); i++) {
        const raceNumber = i + 1;
        // Hitta hästar som är strukna (söker efter "struken", "avstängd", "ej startar" etc.)
        const scratchedRegex = /häst\s+(\d+).*?(struken|avstängd|ej startar|startar inte)/gi;
        const scratchedMatches = [...html.matchAll(scratchedRegex)];
        const scratchedHorses = new Set();
        scratchedMatches.forEach((match) => {
            const horseNumber = parseInt(match[1]);
            if (!isNaN(horseNumber)) {
                scratchedHorses.add(horseNumber);
            }
        });
        console.log(`Avdelning ${raceNumber}: ${scratchedHorses.size} strukna hästar (${Array.from(scratchedHorses).join(", ")})`);
        // Skapa en enkel race-struktur
        const race = {
            raceNumber: raceNumber,
            title: `V75 Avdelning ${raceNumber}`,
            distance: "2640 m",
            trackType: "volte",
            horses: [],
        };
        // Lägg till några exempelhästar (i en riktig implementation skulle vi parsa alla hästar)
        for (let horseNum = 1; horseNum <= 16; horseNum++) {
            race.horses.push({
                number: horseNum,
                name: `Häst ${horseNum}`,
                driver: `Kusk ${horseNum}`,
                track: horseNum,
                record: "1.14,0",
                prizeMoney: 100000,
                v75Percent: 6.25,
                trendPercent: 0,
                vOdds: 16.0,
                pOdds: 16.0,
                shoes: "CC",
                wagon: "VA",
                scratched: scratchedHorses.has(horseNum),
            });
        }
        races.push(race);
    }
    return races;
}
//# sourceMappingURL=simple-scraper.js.map