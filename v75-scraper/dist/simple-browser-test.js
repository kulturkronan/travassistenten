import { chromium } from "playwright";
async function simpleBrowserTest() {
    let browser = null;
    try {
        console.log("🚀 Startar enkel browser-test...");
        browser = await chromium.launch({
            headless: false, // Visa browser
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });
        console.log("🌐 Försöker navigera till ATG...");
        try {
            await page.goto("https://www.atg.se", {
                waitUntil: "domcontentloaded",
                timeout: 30000,
            });
            console.log("✅ ATG:s hemsida laddad");
            // Ta screenshot
            await page.screenshot({ path: "atg-homepage.png" });
            console.log("📸 Screenshot sparad som atg-homepage.png");
            // Prova att gå till inloggningssidan
            console.log("🔗 Navigerar till inloggningssida...");
            await page.goto("https://www.atg.se/logga-in", {
                waitUntil: "domcontentloaded",
                timeout: 30000,
            });
            console.log("✅ Inloggningssida laddad");
            // Ta screenshot av inloggningssidan
            await page.screenshot({ path: "atg-login-page.png" });
            console.log("📸 Screenshot av inloggningssida sparad som atg-login-page.png");
            console.log("⏳ Väntar 10 sekunder för att du ska kunna se sidan...");
            await page.waitForTimeout(10000);
        }
        catch (error) {
            console.error("❌ Fel vid navigation:", error);
        }
    }
    catch (error) {
        console.error("❌ Fel vid browser-test:", error);
    }
    finally {
        console.log("🔒 Stänger browser om 5 sekunder...");
        if (browser) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await browser.close();
            console.log("✅ Browser stängd");
        }
    }
}
simpleBrowserTest();
//# sourceMappingURL=simple-browser-test.js.map