import { chromium } from "playwright";
export async function interactiveLoginSession() {
    let browser = null;
    const steps = [];
    try {
        console.log("🚀 Startar interaktiv inloggningssession...");
        steps.push("Startar browser för interaktiv inloggning");
        browser = await chromium.launch({
            headless: false, // VIKTIGT: Visa browser så du kan interagera
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            slowMo: 1000, // Långsammare för att du ska kunna följa med
        });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });
        steps.push("Browser startad och sida öppnad");
        console.log("🌐 Navigerar till ATG inloggningssida...");
        await page.goto("https://www.atg.se/logga-in", {
            waitUntil: "domcontentloaded", // Snabbare än networkidle
            timeout: 60000, // 60 sekunder timeout
        });
        steps.push("Navigerat till https://www.atg.se/logga-in");
        // Ta screenshot av inloggningssidan
        await page.screenshot({ path: "login-page-initial.png" });
        console.log("📸 Screenshot sparad som login-page-initial.png");
        steps.push("Screenshot av inloggningssida tagen");
        console.log("⏳ Väntar på att du ska logga in manuellt...");
        console.log("👤 Användarnamn: jesSjo680");
        console.log("🔑 Lösenord: Jeppe1599");
        console.log("📝 Logga in nu och jag kommer att spåra processen...");
        // Vänta på att användaren ska logga in
        // Vi väntar på att URL:en ska ändras eller att specifika element ska visas
        try {
            // Vänta på att användaren ska logga in (max 5 minuter)
            await Promise.race([
                // Vänta på att URL ska ändras (framgångsrik inloggning)
                page.waitForFunction(() => {
                    return !window.location.href.includes("/logga-in");
                }, { timeout: 300000 }), // 5 minuter
                // Eller vänta på att inloggningsknappen ska försvinna
                page.waitForFunction(() => {
                    const loginButton = document.querySelector('button[type="submit"], input[type="submit"]');
                    return (!loginButton ||
                        (loginButton.style && loginButton.style.display === "none"));
                }, { timeout: 300000 }),
            ]);
            steps.push("Inloggning upptäckt - URL eller element ändrat");
            // Vänta lite till för att säkerställa att inloggningen är klar
            await page.waitForTimeout(3000);
            // Ta screenshot efter inloggning
            await page.screenshot({ path: "login-after-manual.png" });
            console.log("📸 Screenshot efter inloggning sparad som login-after-manual.png");
            steps.push("Screenshot efter inloggning tagen");
            // Kontrollera om vi är inloggade
            const currentUrl = page.url();
            console.log(`🔗 Aktuell URL efter inloggning: ${currentUrl}`);
            steps.push(`Aktuell URL: ${currentUrl}`);
            // Hämta cookies
            const cookies = await page.context().cookies();
            const cookieString = cookies
                .map((cookie) => `${cookie.name}=${cookie.value}`)
                .join("; ");
            console.log(`🍪 Hittade ${cookies.length} cookies`);
            steps.push(`Hittade ${cookies.length} cookies`);
            // Hämta user agent
            const userAgent = await page.evaluate(() => navigator.userAgent);
            console.log("✅ Inloggning verkar ha lyckats!");
            steps.push("Inloggning verifierad som lyckad");
            return {
                success: true,
                cookies: cookieString,
                userAgent: userAgent,
                steps: steps,
            };
        }
        catch (timeoutError) {
            console.log("⏰ Timeout - ingen inloggning upptäckt inom 5 minuter");
            steps.push("Timeout - ingen inloggning upptäckt");
            return {
                success: false,
                cookies: "",
                userAgent: "",
                steps: steps,
                error: "Timeout - ingen inloggning upptäckt inom 5 minuter",
            };
        }
    }
    catch (error) {
        console.error("❌ Fel vid interaktiv inloggning:", error);
        steps.push(`Fel uppstod: ${error}`);
        return {
            success: false,
            cookies: "",
            userAgent: "",
            steps: steps,
            error: error instanceof Error ? error.message : "Okänt fel",
        };
    }
    finally {
        // Stäng inte browsern direkt - låt användaren se resultatet
        console.log("🔍 Browser kommer att stängas om 30 sekunder...");
        console.log("📋 Sammanfattning av steg:");
        steps.forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
        });
        // Vänta 30 sekunder innan vi stänger browsern
        setTimeout(async () => {
            if (browser) {
                await browser.close();
                console.log("🔒 Browser stängd");
            }
        }, 30000);
    }
}
//# sourceMappingURL=interactive-login.js.map