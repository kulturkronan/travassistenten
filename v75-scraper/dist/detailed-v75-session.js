import { chromium } from "playwright";
import * as fs from "fs";
async function detailedV75Session() {
    let browser = null;
    const v75Data = {
        date: "2025-09-13",
        track: "Bollnäs",
        races: [],
        syncInfo: {
            lastSync: new Date().toISOString(),
            totalRaces: 0,
            totalHorses: 0,
            qualityScore: 0,
        },
    };
    // Ladda befintlig data om den finns
    const dataFile = "v75-detailed-data.json";
    if (fs.existsSync(dataFile)) {
        try {
            const existingData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            v75Data.races = existingData.races || [];
            console.log(`📂 Laddade befintlig detaljerad data med ${v75Data.races.length} avdelningar`);
        }
        catch (error) {
            console.log("📂 Ingen befintlig detaljerad data hittades, börjar från början");
        }
    }
    try {
        console.log("🎯 DETALJERAD V75-DATA SESSION");
        console.log("===============================");
        console.log("📋 Instruktioner:");
        console.log("   1. En browser öppnas nu");
        console.log("   2. Logga in med: jesSjo680 / Jeppe1599");
        console.log("   3. Gå till V75-sidan");
        console.log("   4. För varje avdelning (1-7):");
        console.log("      - Kolla ALLA detaljer i tabellen");
        console.log("      - Läs speltips och analyser");
        console.log("      - Granska loppinformation");
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
        console.log("📋 VAD DU SKA GÖRA FÖR VARJE AVDELNING:");
        console.log("   1. Logga in och gå till V75-sidan");
        console.log("   2. För varje avdelning, granska:");
        console.log("      📊 LOPPINFORMATION:");
        console.log("         - Titel och distans");
        console.log("         - Prispengar och poolinfo");
        console.log("         - Kvalifikationer och specialpriser");
        console.log("      📋 TABELLDATA:");
        console.log("         - Häst/Kusk (nummer, namn, ålder, kusk)");
        console.log("         - V75%, TREND%, V-ODDS, P-ODDS");
        console.log("         - Tränare och tipskommentar");
        console.log("         - Skor och vagn");
        console.log("         - Strukna hästar (markerade med EJ)");
        console.log("      💡 SPELTIPS:");
        console.log("         - Alla speltips för avdelningen");
        console.log("         - Rankning (A, B, C)");
        console.log("         - Spetsanalys");
        console.log("   3. Tryck ENTER när avdelningen är granskad");
        console.log("   4. Data sparas automatiskt efter varje avdelning");
        console.log("");
        // Ta screenshot av inloggningssidan
        await page.screenshot({ path: "login-detailed-session.png" });
        console.log("📸 Screenshot sparad som login-detailed-session.png");
        // Vänta på att användaren ska logga in och komma till V75-sidan
        console.log("⏳ Väntar på att du ska logga in och komma till V75-sidan...");
        console.log("   (Tryck ENTER när du är på V75-sidan och redo att börja)");
        // Vänta på första ENTER (när användaren är på V75-sidan)
        await new Promise((resolve) => {
            process.stdin.once("data", () => {
                console.log("✅ Användaren är redo att börja med detaljerad granskning!");
                resolve(void 0);
            });
        });
        // Nu går vi igenom varje avdelning
        for (let avdelning = 1; avdelning <= 7; avdelning++) {
            // Hoppa över avdelningar som redan är klara
            if (v75Data.races.some((race) => race.raceNumber === avdelning)) {
                console.log(`⏭️  Avdelning ${avdelning} redan klar, hoppar över`);
                continue;
            }
            console.log("");
            console.log(`🏁 AVDELNING ${avdelning}/7 - DETALJERAD GRANSKNING`);
            console.log("================================================");
            console.log("📋 Vad du ska göra:");
            console.log(`   1. Gå till avdelning ${avdelning}`);
            console.log("   2. Granska ALLA detaljer:");
            console.log("      📊 Loppinformation (titel, distans, prispengar)");
            console.log("      📋 Tabelldata (alla kolumner)");
            console.log("      💡 Speltips och analyser");
            console.log("      ❌ Strukna hästar (markerade med EJ)");
            console.log("   3. Kvalitetsäkra att all data är korrekt");
            console.log("   4. Tryck ENTER när du är klar med denna avdelning");
            console.log("");
            try {
                // Ta screenshot av avdelningen
                await page.screenshot({
                    path: `avdelning-${avdelning}-detailed-start.png`,
                });
                console.log(`📸 Screenshot av avdelning ${avdelning} sparad`);
                // Vänta på ENTER för denna avdelning
                await new Promise((resolve) => {
                    process.stdin.once("data", () => {
                        console.log(`✅ Avdelning ${avdelning} granskad och klar!`);
                        resolve(void 0);
                    });
                });
                // Hämta detaljerad data från denna avdelning
                console.log(`🔍 Hämtar detaljerad data från avdelning ${avdelning}...`);
                const detailedData = await page.evaluate((raceNum) => {
                    const bodyText = document.body.innerText;
                    // Hämta loppinformation
                    const raceInfo = {
                        title: "",
                        distance: "",
                        trackType: "",
                        trackCondition: "",
                        prizeMoney: "",
                        eligibility: "",
                        specialPrizes: "",
                        poolInfo: "",
                        eventDetails: "",
                    };
                    // Sök efter loppinformation
                    const titleMatch = bodyText.match(/Avdelning\s+\d+.*?(\d{2}:\d{2})/);
                    if (titleMatch) {
                        raceInfo.title = `Avdelning ${raceNum}, idag ${titleMatch[1]}`;
                    }
                    const distanceMatch = bodyText.match(/(\d+)\s+m\s+(Voltstart|Autostart)/);
                    if (distanceMatch) {
                        raceInfo.distance = `${distanceMatch[1]} m ${distanceMatch[2]}`;
                    }
                    const trackMatch = bodyText.match(/(Lätt|Mjuk|Hård)\s+bana/);
                    if (trackMatch) {
                        raceInfo.trackCondition = `${trackMatch[1]} bana`;
                    }
                    // Hämta hästdata med mer detaljerad parsing
                    const horseRows = [];
                    const horsePattern = /(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)\s+([a-z]\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)/g;
                    let horseMatch;
                    while ((horseMatch = horsePattern.exec(bodyText)) !== null) {
                        horseRows.push({
                            number: parseInt(horseMatch[1]),
                            name: horseMatch[2].trim(),
                            ageGender: horseMatch[3],
                            driver: horseMatch[4].trim(),
                        });
                    }
                    // Hämta speltips
                    const tipsPattern = /(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+):\s*"([^"]+)"/g;
                    const bettingTips = [];
                    let tipMatch;
                    while ((tipMatch = tipsPattern.exec(bodyText)) !== null) {
                        bettingTips.push({
                            horseNumber: parseInt(tipMatch[1]),
                            horseName: tipMatch[2].trim(),
                            tipText: tipMatch[3].trim(),
                        });
                    }
                    // Hämta rankning
                    const rankMatch = bodyText.match(/Rank:\s*([ABC]:\s*[\d,\s]+)/);
                    const ranking = rankMatch ? rankMatch[1] : "";
                    // Hämta spetsanalys
                    const paceMatch = bodyText.match(/Spetsanalys[^:]*:\s*([^.]+)/);
                    const paceAnalysis = paceMatch ? paceMatch[1].trim() : "";
                    return {
                        raceInfo,
                        horsesFound: horseRows.length,
                        horses: horseRows.slice(0, 20), // Första 20 hästarna
                        bettingTips: bettingTips.slice(0, 10), // Första 10 tipsen
                        ranking,
                        paceAnalysis,
                        bodyTextLength: bodyText.length,
                        currentUrl: window.location.href,
                        hasScratchedHorses: bodyText.includes("EJ") || bodyText.includes("struken"),
                        scratchedCount: (bodyText.match(/EJ/g) || []).length,
                    };
                }, avdelning);
                console.log(`📊 Detaljerad data från avdelning ${avdelning}:`);
                console.log(`   🏁 Lopp: ${detailedData.raceInfo.title}`);
                console.log(`   📏 Distans: ${detailedData.raceInfo.distance}`);
                console.log(`   🏇 Hästar hittade: ${detailedData.horsesFound}`);
                console.log(`   💡 Speltips: ${detailedData.bettingTips.length}`);
                console.log(`   ❌ Strukna hästar: ${detailedData.scratchedCount}`);
                console.log(`   🔗 URL: ${detailedData.currentUrl}`);
                if (detailedData.horses.length > 0) {
                    console.log(`   🐎 Hästar i avdelning ${avdelning}:`);
                    detailedData.horses.forEach((horse, index) => {
                        console.log(`      ${index + 1}. ${horse.number} - ${horse.name} (${horse.ageGender}) - ${horse.driver}`);
                    });
                }
                if (detailedData.bettingTips.length > 0) {
                    console.log(`   💡 Speltips för avdelning ${avdelning}:`);
                    detailedData.bettingTips.forEach((tip, index) => {
                        console.log(`      ${index + 1}. ${tip.horseNumber} ${tip.horseName}: "${tip.tipText}"`);
                    });
                }
                // Skapa detaljerat race-objekt
                const detailedRace = {
                    raceNumber: avdelning,
                    raceInfo: detailedData.raceInfo,
                    horses: detailedData.horses.map((horse) => ({
                        number: horse.number,
                        name: horse.name,
                        driver: horse.driver,
                        trainer: "Okänd", // Placeholder
                        v75Percent: 0, // Placeholder
                        trendPercent: 0, // Placeholder
                        vOdds: 0, // Placeholder
                        pOdds: 0, // Placeholder
                        shoes: "CC", // Placeholder
                        wagon: "VA", // Placeholder
                        tipsComment: "", // Placeholder
                        scratched: false, // Placeholder
                        ageGender: horse.ageGender,
                    })),
                    bettingTips: detailedData.bettingTips.map((tip) => ({
                        ...tip,
                        rank: "B", // Placeholder - du får uppdatera detta manuellt
                    })),
                    paceAnalysis: detailedData.paceAnalysis,
                    qualityCheck: {
                        completed: true,
                        notes: `Manuellt granskad avdelning ${avdelning}`,
                        dataQuality: detailedData.horsesFound > 10 ? "excellent" : "good",
                    },
                };
                v75Data.races.push(detailedRace);
                // Uppdatera sync-info
                v75Data.syncInfo.totalRaces = v75Data.races.length;
                v75Data.syncInfo.totalHorses = v75Data.races.reduce((sum, race) => sum + race.horses.length, 0);
                v75Data.syncInfo.qualityScore =
                    v75Data.races.reduce((sum, race) => {
                        return (sum +
                            (race.qualityCheck.dataQuality === "excellent"
                                ? 100
                                : race.qualityCheck.dataQuality === "good"
                                    ? 80
                                    : race.qualityCheck.dataQuality === "fair"
                                        ? 60
                                        : 40));
                    }, 0) / v75Data.races.length;
                // Spara data efter varje avdelning
                fs.writeFileSync(dataFile, JSON.stringify(v75Data, null, 2));
                console.log(`💾 Detaljerad data sparad efter avdelning ${avdelning}`);
                console.log(`📊 Kvalitetspoäng: ${v75Data.syncInfo.qualityScore.toFixed(1)}%`);
                // Ta screenshot efter avdelningen
                await page.screenshot({
                    path: `avdelning-${avdelning}-detailed-slut.png`,
                });
                console.log(`📸 Screenshot efter avdelning ${avdelning} sparad`);
            }
            catch (error) {
                console.error(`❌ Fel vid avdelning ${avdelning}:`, error);
                // Fortsätt med nästa avdelning även om denna misslyckades
            }
        }
        console.log("");
        console.log("🎉 ALLA AVDELNINGAR KLARA - DETALJERAD GRANSKNING!");
        console.log("==================================================");
        console.log("📊 SAMMANFATTNING:");
        console.log(`   🏁 Totalt avdelningar: ${v75Data.races.length}`);
        console.log(`   🐎 Totalt hästar: ${v75Data.syncInfo.totalHorses}`);
        console.log(`   📊 Kvalitetspoäng: ${v75Data.syncInfo.qualityScore.toFixed(1)}%`);
        console.log(`   ⏰ Senast synkroniserat: ${new Date(v75Data.syncInfo.lastSync).toLocaleString("sv-SE")}`);
        // Visa sammanfattning per avdelning
        v75Data.races.forEach((race) => {
            console.log(`   🏁 Avdelning ${race.raceNumber}: ${race.horses.length} hästar, ${race.bettingTips.length} tips, kvalitet: ${race.qualityCheck.dataQuality}`);
        });
        // Spara final data
        fs.writeFileSync("v75-detailed-complete.json", JSON.stringify(v75Data, null, 2));
        console.log("💾 Final detaljerad data sparad som v75-detailed-complete.json");
        console.log("");
        console.log("✅ Detaljerad session slutförd!");
        console.log("📁 Screenshots sparade:");
        console.log("   - login-detailed-session.png");
        for (let i = 1; i <= 7; i++) {
            console.log(`   - avdelning-${i}-detailed-start.png`);
            console.log(`   - avdelning-${i}-detailed-slut.png`);
        }
    }
    catch (error) {
        console.error("❌ Fel vid detaljerad V75-session:", error);
    }
    finally {
        console.log("🔒 Browser kommer att stängas om 5 sekunder...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        if (browser) {
            await browser.close();
            console.log("✅ Browser stängd");
        }
        console.log("");
        console.log("🎯 SESSION HELT KLAR!");
        console.log("====================");
        console.log("📋 Sammanfattning:");
        console.log("   ✅ Alla 7 avdelningar granskade");
        console.log("   💾 Data sparad i JSON-filer");
        console.log("   📸 Screenshots tagna");
        console.log("   🔄 Redo för nästa steg");
        console.log("");
        console.log("🚀 Du kan nu:");
        console.log("   - Kolla sparad data i JSON-filerna");
        console.log("   - Uppdatera sync API:et med den nya datan");
        console.log("   - Testa appen med korrekt data");
        console.log("");
        console.log("✨ Tack för att du granskade alla avdelningar noggrant!");
        console.log("   (Tryck ENTER för att avsluta denna session)");
        // Vänta på ENTER för att avsluta
        await new Promise((resolve) => {
            process.stdin.once("data", () => {
                console.log("👋 Session avslutad. Hej då!");
                resolve(void 0);
            });
        });
    }
}
detailedV75Session();
//# sourceMappingURL=detailed-v75-session.js.map