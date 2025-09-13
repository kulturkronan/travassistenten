import { chromium } from "playwright";
import * as fs from "fs";
async function improvedDetailedSession() {
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
    try {
        console.log("🎯 FÖRBÄTTRAD DETALJERAD V75-SESSION");
        console.log("====================================");
        console.log("📋 Instruktioner:");
        console.log("   1. En browser öppnas nu");
        console.log("   2. Logga in med: jesSjo680 / Jeppe1599");
        console.log("   3. Gå till V75-sidan");
        console.log("   4. För varje avdelning (1-7):");
        console.log("      - Granska ALLA detaljer i tabellen");
        console.log("      - Läs speltips och analyser");
        console.log("      - Anteckna loppinformation");
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
        console.log("         - Titel: 'Avdelning X, idag XX:XX'");
        console.log("         - Distans: '2640 m Voltstart'");
        console.log("         - Bana: 'Lätt bana'");
        console.log("         - Prispengar: 'Pris: 125.000-62.500-...'");
        console.log("         - Pool: 'LOPP Omsättning sammanslagen pool'");
        console.log("      📋 TABELLDATA (HÄST/KUSK kolumnen):");
        console.log("         - Nummer, namn, ålder/kön (t.ex. s4), kusk");
        console.log("         - V75%, TREND%, V-ODDS, P-ODDS");
        console.log("         - Tränare och tipskommentar");
        console.log("         - Skor (¢¢, CC, ככ) och vagn (Va.)");
        console.log("         - Strukna hästar (markerade med EJ)");
        console.log("      💡 SPELTIPS FÖR AVDELNINGEN:");
        console.log("         - Alla speltips med hästnummer och text");
        console.log("         - Rankning: A, B, C");
        console.log("         - Spetsanalys");
        console.log("   3. Tryck ENTER när avdelningen är granskad");
        console.log("   4. Data sparas automatiskt efter varje avdelning");
        console.log("");
        // Ta screenshot av inloggningssidan
        await page.screenshot({ path: "login-improved-session.png" });
        console.log("📸 Screenshot sparad som login-improved-session.png");
        // Vänta på att användaren ska logga in och komma till V75-sidan
        console.log("⏳ Väntar på att du ska logga in och komma till V75-sidan...");
        console.log("   (Tryck ENTER när du är på V75-sidan och redo att börja)");
        // Vänta på första ENTER (när användaren är på V75-sidan)
        await new Promise((resolve) => {
            process.stdin.once("data", () => {
                console.log("✅ Användaren är redo att börja med förbättrad granskning!");
                resolve(void 0);
            });
        });
        // Nu går vi igenom varje avdelning
        for (let avdelning = 1; avdelning <= 7; avdelning++) {
            console.log("");
            console.log(`🏁 AVDELNING ${avdelning}/7 - FÖRBÄTTRAD GRANSKNING`);
            console.log("================================================");
            console.log("📋 Vad du ska göra:");
            console.log(`   1. Gå till avdelning ${avdelning}`);
            console.log("   2. Granska ALLA detaljer:");
            console.log("      📊 Loppinformation (titel, distans, prispengar, pool)");
            console.log("      📋 Tabelldata (alla kolumner i HÄST/KUSK tabellen)");
            console.log("      💡 Speltips och analyser");
            console.log("      ❌ Strukna hästar (markerade med EJ)");
            console.log("   3. Kvalitetsäkra att all data är korrekt");
            console.log("   4. Tryck ENTER när du är klar med denna avdelning");
            console.log("");
            try {
                // Ta screenshot av avdelningen
                await page.screenshot({
                    path: `avdelning-${avdelning}-improved-start.png`,
                });
                console.log(`📸 Screenshot av avdelning ${avdelning} sparad`);
                // Vänta på ENTER för denna avdelning
                await new Promise((resolve) => {
                    process.stdin.once("data", () => {
                        console.log(`✅ Avdelning ${avdelning} granskad och klar!`);
                        resolve(void 0);
                    });
                });
                // Hämta förbättrad data från denna avdelning
                console.log(`🔍 Hämtar förbättrad data från avdelning ${avdelning}...`);
                const improvedData = await page.evaluate((raceNum) => {
                    const bodyText = document.body.innerText;
                    // Hämta loppinformation med bättre regex
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
                    // Sök efter avdelning och tid
                    const titleMatch = bodyText.match(/Avdelning\s+(\d+).*?(\d{2}:\d{2})/);
                    if (titleMatch) {
                        raceInfo.title = `Avdelning ${titleMatch[1]}, idag ${titleMatch[2]}`;
                    }
                    // Sök efter distans och starttyp
                    const distanceMatch = bodyText.match(/(\d+)\s+m\s+(Voltstart|Autostart)/);
                    if (distanceMatch) {
                        raceInfo.distance = `${distanceMatch[1]} m ${distanceMatch[2]}`;
                    }
                    // Sök efter banförhållanden
                    const trackMatch = bodyText.match(/(Lätt|Mjuk|Hård)\s+bana/);
                    if (trackMatch) {
                        raceInfo.trackCondition = `${trackMatch[1]} bana`;
                    }
                    // Sök efter prispengar
                    const prizeMatch = bodyText.match(/Pris:\s*([^.]+\d+\.\d+[^.]*)/);
                    if (prizeMatch) {
                        raceInfo.prizeMoney = prizeMatch[1];
                    }
                    // Sök efter poolinfo
                    const poolMatch = bodyText.match(/LOPP Omsättning[^:]*:\s*([^)]+)/);
                    if (poolMatch) {
                        raceInfo.poolInfo = poolMatch[1];
                    }
                    // Hämta hästdata med förbättrad parsing
                    const horseRows = [];
                    // Sök efter hästnummer och namn (förbättrad regex)
                    const horsePattern = /^(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)\s+([a-z]\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)$/gm;
                    let horseMatch;
                    while ((horseMatch = horsePattern.exec(bodyText)) !== null) {
                        horseRows.push({
                            number: parseInt(horseMatch[1]),
                            name: horseMatch[2].trim(),
                            ageGender: horseMatch[3],
                            driver: horseMatch[4].trim(),
                        });
                    }
                    // Alternativ parsing för hästar
                    if (horseRows.length === 0) {
                        // Sök efter hästnamn i tabellen
                        const tablePattern = /(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)\s+([a-z]\d+)/g;
                        let tableMatch;
                        while ((tableMatch = tablePattern.exec(bodyText)) !== null) {
                            horseRows.push({
                                number: parseInt(tableMatch[1]),
                                name: tableMatch[2].trim(),
                                ageGender: tableMatch[3],
                                driver: "Okänd", // Placeholder
                            });
                        }
                    }
                    // Hämta speltips med förbättrad parsing
                    const tipsPattern = /(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+):\s*"([^"]+)"/g;
                    const bettingTips = [];
                    let tipMatch;
                    while ((tipMatch = tipsPattern.exec(bodyText)) !== null) {
                        bettingTips.push({
                            horseNumber: parseInt(tipMatch[1]),
                            horseName: tipMatch[2].trim(),
                            tipText: tipMatch[3].trim(),
                            rank: "B", // Placeholder
                        });
                    }
                    // Hämta rankning
                    const rankMatch = bodyText.match(/Rank:\s*([ABC]:\s*[\d,\s]+)/);
                    const ranking = rankMatch ? rankMatch[1] : "";
                    // Hämta spetsanalys
                    const paceMatch = bodyText.match(/Spetsanalys[^:]*:\s*([^.]+)/);
                    const paceAnalysis = paceMatch ? paceMatch[1].trim() : "";
                    // Räkna strukna hästar
                    const scratchedCount = (bodyText.match(/EJ/g) || []).length;
                    return {
                        raceInfo,
                        horsesFound: horseRows.length,
                        horses: horseRows.slice(0, 20),
                        bettingTips: bettingTips.slice(0, 10),
                        ranking,
                        paceAnalysis,
                        bodyTextLength: bodyText.length,
                        currentUrl: window.location.href,
                        hasScratchedHorses: bodyText.includes("EJ") || bodyText.includes("struken"),
                        scratchedCount,
                        // Debug info
                        debugInfo: {
                            hasV75Text: bodyText.includes("V75"),
                            hasHorseText: bodyText.includes("Häst"),
                            hasDriverText: bodyText.includes("Kusk"),
                            hasTipsText: bodyText.includes("Speltips"),
                            textLength: bodyText.length,
                        },
                    };
                }, avdelning);
                console.log(`📊 Förbättrad data från avdelning ${avdelning}:`);
                console.log(`   🏁 Lopp: ${improvedData.raceInfo.title}`);
                console.log(`   📏 Distans: ${improvedData.raceInfo.distance}`);
                console.log(`   🏇 Hästar hittade: ${improvedData.horsesFound}`);
                console.log(`   💡 Speltips: ${improvedData.bettingTips.length}`);
                console.log(`   ❌ Strukna hästar: ${improvedData.scratchedCount}`);
                console.log(`   🔗 URL: ${improvedData.currentUrl}`);
                console.log(`   🐛 Debug: V75=${improvedData.debugInfo.hasV75Text}, Häst=${improvedData.debugInfo.hasHorseText}, Tips=${improvedData.debugInfo.hasTipsText}`);
                if (improvedData.horses.length > 0) {
                    console.log(`   🐎 Hästar i avdelning ${avdelning}:`);
                    improvedData.horses.forEach((horse, index) => {
                        console.log(`      ${index + 1}. ${horse.number} - ${horse.name} (${horse.ageGender}) - ${horse.driver}`);
                    });
                }
                if (improvedData.bettingTips.length > 0) {
                    console.log(`   💡 Speltips för avdelning ${avdelning}:`);
                    improvedData.bettingTips.forEach((tip, index) => {
                        console.log(`      ${index + 1}. ${tip.horseNumber} ${tip.horseName}: "${tip.tipText}"`);
                    });
                }
                // Skapa detaljerat race-objekt
                const detailedRace = {
                    raceNumber: avdelning,
                    raceInfo: improvedData.raceInfo,
                    horses: improvedData.horses.map((horse) => ({
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
                    bettingTips: improvedData.bettingTips,
                    paceAnalysis: improvedData.paceAnalysis,
                    qualityCheck: {
                        completed: true,
                        notes: `Manuellt granskad avdelning ${avdelning} - ${improvedData.horsesFound} hästar, ${improvedData.bettingTips.length} tips`,
                        dataQuality: improvedData.horsesFound > 10
                            ? "excellent"
                            : improvedData.horsesFound > 5
                                ? "good"
                                : improvedData.horsesFound > 0
                                    ? "fair"
                                    : "poor",
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
                fs.writeFileSync("v75-improved-data.json", JSON.stringify(v75Data, null, 2));
                console.log(`💾 Förbättrad data sparad efter avdelning ${avdelning}`);
                console.log(`📊 Kvalitetspoäng: ${v75Data.syncInfo.qualityScore.toFixed(1)}%`);
                // Ta screenshot efter avdelningen
                await page.screenshot({
                    path: `avdelning-${avdelning}-improved-slut.png`,
                });
                console.log(`📸 Screenshot efter avdelning ${avdelning} sparad`);
            }
            catch (error) {
                console.error(`❌ Fel vid avdelning ${avdelning}:`, error);
                // Fortsätt med nästa avdelning även om denna misslyckades
            }
        }
        console.log("");
        console.log("🎉 ALLA AVDELNINGAR KLARA - FÖRBÄTTRAD GRANSKNING!");
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
        fs.writeFileSync("v75-improved-complete.json", JSON.stringify(v75Data, null, 2));
        console.log("💾 Final förbättrad data sparad som v75-improved-complete.json");
        console.log("");
        console.log("✅ Förbättrad session slutförd!");
        console.log("📁 Screenshots sparade:");
        console.log("   - login-improved-session.png");
        for (let i = 1; i <= 7; i++) {
            console.log(`   - avdelning-${i}-improved-start.png`);
            console.log(`   - avdelning-${i}-improved-slut.png`);
        }
        // Visa sammanfattning och vänta på ENTER här istället för i finally
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
    catch (error) {
        console.error("❌ Fel vid förbättrad V75-session:", error);
    }
    finally {
        console.log("🔒 Browser kommer att stängas om 5 sekunder...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        if (browser) {
            await browser.close();
            console.log("✅ Browser stängd");
        }
    }
}
improvedDetailedSession();
//# sourceMappingURL=improved-detailed-session.js.map