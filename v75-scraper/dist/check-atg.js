import { chromium } from "playwright";
async function checkATG() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    try {
        console.log("Navigerar till ATG V75-sida...");
        await page.goto("https://www.atg.se/spel/v75", {
            waitUntil: "networkidle",
            timeout: 30000,
        });
        // Ta screenshot
        await page.screenshot({ path: "atg-v75-page.png" });
        console.log("Screenshot sparad som atg-v75-page.png");
        // Hitta alla hästar som är strukna
        const scratchedHorses = await page.evaluate(() => {
            const horses = [];
            // Sök efter text som indikerar strukna hästar
            const text = document.body.innerText;
            // Olika mönster för strukna hästar
            const patterns = [
                /häst\s+(\d+).*?(struken|avstängd|ej startar|startar inte|avbruten)/gi,
                /(\d+).*?(struken|avstängd|ej startar|startar inte|avbruten)/gi,
                /struken.*?(\d+)/gi,
                /avstängd.*?(\d+)/gi,
            ];
            patterns.forEach((pattern) => {
                let match;
                while ((match = pattern.exec(text)) !== null) {
                    const horseNumber = parseInt(match[1] || match[2]);
                    if (!isNaN(horseNumber)) {
                        horses.push({
                            race: 1, // Vi fokuserar på första avdelningen först
                            number: horseNumber,
                            name: `Häst ${horseNumber}`,
                            reason: match[0],
                        });
                    }
                }
            });
            return horses;
        });
        console.log("Strukna hästar hittade:");
        scratchedHorses.forEach((horse) => {
            console.log(`  Avdelning ${horse.race}, Häst ${horse.number}: ${horse.reason}`);
        });
        // Hämta HTML för manuell inspektion
        const html = await page.content();
        console.log("HTML längd:", html.length);
        // Spara HTML för manuell inspektion
        const fs = await import("fs");
        fs.writeFileSync("atg-v75-html.html", html);
        console.log("HTML sparad som atg-v75-html.html");
    }
    catch (error) {
        console.error("Fel:", error);
    }
    finally {
        await browser.close();
    }
}
checkATG();
//# sourceMappingURL=check-atg.js.map