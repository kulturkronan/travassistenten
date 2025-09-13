import { chromium } from "playwright";
import * as fs from 'fs';
async function robustV75Session() {
    let browser = null;
    const v75Data = {
        date: "2025-09-13",
        track: "Bollnäs",
        races: []
    };
    // Ladda befintlig data om den finns
    const dataFile = 'v75-progress-data.json';
    if (fs.existsSync(dataFile)) {
        try {
            const existingData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
            v75Data.races = existingData.races || [];
            console.log(`📂 Laddade befintlig data med ${v75Data.races.length} avdelningar`);
        }
        catch (error) {
            console.log("📂 Ingen befintlig data hittades, börjar från början");
        }
    }
    try {
        console.log("🎯 ROBUST V75-DATA SESSION");
        console.log("===========================");
        console.log("📋 Instruktioner:");
        console.log("   1. En browser öppnas nu");
        console.log("   2. Logga in med: jesSjo680 / Jeppe1599");
        console.log("   3. Gå till V75-sidan");
        console.log("   4. För varje avdelning (1-7):");
        console.log("      - Kolla vilka hästar som är strukna");
        console.log("      - Klicka på hästar för att se historisk data");
        console.log("      - Tryck ENTER när du är klar med avdelningen");
        console.log("   5. Data sparas automatiskt efter varje avdelning");
        console.log("   6. Stäng browsern när du är helt klar");
        console.log("");
        browser = await chromium.launch({
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });
        console.log("🌐 Öppnar ATG inloggningssida...");
        await page.goto("https://www.atg.se/logga-in", {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        console.log("✅ Inloggningssida laddad!");
        console.log("👤 Användarnamn: jesSjo680");
        console.log("🔑 Lösenord: Jeppe1599");
        console.log("");
        console.log("📋 VAD DU SKA GÖRA:");
        console.log("   1. Logga in med uppgifterna ovan");
        console.log("   2. Gå till V75-sidan (https://www.atg.se/spel/v75)");
        console.log("   3. För varje avdelning:");
        console.log("      - Kolla vilka hästar som är strukna");
        console.log("      - Klicka på hästar för historisk data");
        console.log("      - Tryck ENTER när avdelningen är klar");
        console.log("   4. Data sparas automatiskt efter varje avdelning");
        console.log("   5. Stäng browsern när alla 7 avdelningar är klara");
        console.log("");
        // Ta screenshot av inloggningssidan
        await page.screenshot({ path: "login-page-robust.png" });
        console.log("📸 Screenshot sparad som login-page-robust.png");
        // Vänta på att användaren ska logga in och komma till V75-sidan
        console.log("⏳ Väntar på att du ska logga in och komma till V75-sidan...");
        console.log("   (Tryck ENTER när du är på V75-sidan och redo att börja)");
        // Vänta på första ENTER (när användaren är på V75-sidan)
        await new Promise((resolve) => {
            process.stdin.once('data', () => {
                console.log("✅ Användaren är redo att börja med avdelningarna!");
                resolve(void 0);
            });
        });
        // Nu går vi igenom varje avdelning
        for (let avdelning = 1; avdelning <= 7; avdelning++) {
            // Hoppa över avdelningar som redan är klara
            if (v75Data.races.some(race => race.raceNumber === avdelning)) {
                console.log(`⏭️  Avdelning ${avdelning} redan klar, hoppar över`);
                continue;
            }
            console.log("");
            console.log(`🏁 AVDELNING ${avdelning}/7`);
            console.log("========================");
            console.log("📋 Vad du ska göra:");
            console.log(`   1. Gå till avdelning ${avdelning}`);
            console.log("   2. Kolla vilka hästar som är strukna");
            console.log("   3. Klicka på hästar för att se historisk data");
            console.log("   4. Anteckna all viktig information");
            console.log("   5. Tryck ENTER när du är klar med denna avdelning");
            console.log("");
            try {
                // Ta screenshot av avdelningen
                await page.screenshot({ path: `avdelning-${avdelning}-start.png` });
                console.log(`📸 Screenshot av avdelning ${avdelning} sparad`);
                // Vänta på ENTER för denna avdelning
                await new Promise((resolve) => {
                    process.stdin.once('data', () => {
                        console.log(`✅ Avdelning ${avdelning} klar!`);
                        resolve(void 0);
                    });
                });
                // Hämta data från denna avdelning
                console.log(`🔍 Hämtar data från avdelning ${avdelning}...`);
                const raceData = await page.evaluate((raceNum) => {
                    const bodyText = document.body.innerText;
                    // Sök efter hästdata för denna avdelning
                    const horsePattern = /\d+\s+([A-ZÅÄÖ][a-zåäö\s]+)/g;
                    const horses = [];
                    let match;
                    while ((match = horsePattern.exec(bodyText)) !== null) {
                        horses.push(match[1].trim());
                    }
                    // Sök efter strukna hästar
                    const scratchedPattern = /(struken|avstängd|ej startar|startar inte)/gi;
                    const scratchedMatches = bodyText.match(scratchedPattern);
                    // Sök efter hästnamn med mer detaljerad parsing
                    const detailedHorsePattern = /(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)\s+([A-ZÅÄÖ][a-zåäö\s]+)/g;
                    const detailedHorses = [];
                    let detailedMatch;
                    while ((detailedMatch = detailedHorsePattern.exec(bodyText)) !== null) {
                        detailedHorses.push({
                            number: detailedMatch[1],
                            name: detailedMatch[2],
                            driver: detailedMatch[3]
                        });
                    }
                    return {
                        horsesFound: horses.length,
                        detailedHorsesFound: detailedHorses.length,
                        scratchedFound: scratchedMatches ? scratchedMatches.length : 0,
                        horses: horses.slice(0, 20),
                        detailedHorses: detailedHorses.slice(0, 10),
                        bodyTextLength: bodyText.length,
                        currentUrl: window.location.href
                    };
                }, avdelning);
                console.log(`📊 Data från avdelning ${avdelning}:`);
                console.log(`   🐎 Hästar hittade: ${raceData.horsesFound}`);
                console.log(`   🐎 Detaljerade hästar: ${raceData.detailedHorsesFound}`);
                console.log(`   ❌ Strukna hästar: ${raceData.scratchedFound}`);
                console.log(`   🔗 URL: ${raceData.currentUrl}`);
                if (raceData.detailedHorses.length > 0) {
                    console.log(`   🐎 Hästar i avdelning ${avdelning}:`);
                    raceData.detailedHorses.forEach((horse, index) => {
                        console.log(`      ${index + 1}. ${horse.number} - ${horse.name} - ${horse.driver}`);
                    });
                }
                // Skapa race-objekt för denna avdelning
                const race = {
                    raceNumber: avdelning,
                    title: `V75 Avdelning ${avdelning}`,
                    distance: "2640 m",
                    trackType: "volte",
                    horses: raceData.detailedHorses.map(horse => ({
                        number: parseInt(horse.number),
                        name: horse.name,
                        driver: horse.driver,
                        track: parseInt(horse.number),
                        record: "1.14,0", // Placeholder
                        prizeMoney: 100000, // Placeholder
                        v75Percent: 6.25, // Placeholder
                        trendPercent: 0, // Placeholder
                        vOdds: 16.0, // Placeholder
                        pOdds: 16.0, // Placeholder
                        shoes: "CC", // Placeholder
                        wagon: "VA", // Placeholder
                        scratched: false, // Placeholder - du får uppdatera detta manuellt
                        historicalData: null // Placeholder för historisk data
                    }))
                };
                v75Data.races.push(race);
                // Spara data efter varje avdelning
                fs.writeFileSync(dataFile, JSON.stringify(v75Data, null, 2));
                console.log(`💾 Data sparad efter avdelning ${avdelning}`);
                // Ta screenshot efter avdelningen
                await page.screenshot({ path: `avdelning-${avdelning}-slut.png` });
                console.log(`📸 Screenshot efter avdelning ${avdelning} sparad`);
            }
            catch (error) {
                console.error(`❌ Fel vid avdelning ${avdelning}:`, error);
                // Fortsätt med nästa avdelning även om denna misslyckades
            }
        }
        console.log("");
        console.log("🎉 ALLA AVDELNINGAR KLARA!");
        console.log("==========================");
        console.log("📊 SAMMANFATTNING:");
        console.log(`   🏁 Totalt avdelningar: ${v75Data.races.length}`);
        console.log(`   🐎 Totalt hästar: ${v75Data.races.reduce((sum, race) => sum + race.horses.length, 0)}`);
        // Visa alla hästar från alla avdelningar
        v75Data.races.forEach(race => {
            console.log(`   🏁 Avdelning ${race.raceNumber}: ${race.horses.length} hästar`);
            race.horses.forEach(horse => {
                console.log(`      ${horse.number}. ${horse.name} - ${horse.driver}`);
            });
        });
        // Spara final data
        fs.writeFileSync('v75-complete-data.json', JSON.stringify(v75Data, null, 2));
        console.log("💾 Final data sparad som v75-complete-data.json");
        console.log("");
        console.log("✅ Session slutförd!");
        console.log("📁 Screenshots sparade:");
        console.log("   - login-page-robust.png");
        for (let i = 1; i <= 7; i++) {
            console.log(`   - avdelning-${i}-start.png`);
            console.log(`   - avdelning-${i}-slut.png`);
        }
    }
    catch (error) {
        console.error("❌ Fel vid robust V75-session:", error);
    }
    finally {
        console.log("🔒 Browser kommer att stängas om 5 sekunder...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (browser) {
            await browser.close();
            console.log("✅ Browser stängd");
        }
    }
}
robustV75Session();
//# sourceMappingURL=robust-v75-session.js.map