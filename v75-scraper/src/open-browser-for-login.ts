import { chromium, Browser, Page } from "playwright";

async function openBrowserForLogin() {
  let browser: Browser | null = null;

  try {
    console.log("🚀 Öppnar browser för manuell inloggning...");

    browser = await chromium.launch({
      headless: false, // Visa browser
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log("🌐 Navigerar till ATG inloggningssida...");
    await page.goto("https://www.atg.se/logga-in", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("✅ Inloggningssida laddad!");
    console.log("");
    console.log("👤 Användarnamn: jesSjo680");
    console.log("🔑 Lösenord: Jeppe1599");
    console.log("");
    console.log("📋 Instruktioner:");
    console.log("   1. Logga in med uppgifterna ovan");
    console.log("   2. När du är inloggad, navigera till V75-sidan");
    console.log("   3. Kolla vilka hästar som är strukna i alla avdelningar");
    console.log("   4. Browser stängs automatiskt efter 2 minuter");
    console.log("");

    // Ta screenshot av inloggningssidan
    await page.screenshot({ path: "login-page-for-manual.png" });
    console.log("📸 Screenshot sparad som login-page-for-manual.png");

    // Vänta 2 minuter för att du ska kunna logga in och utforska
    console.log("⏳ Väntar 2 minuter för manuell inloggning...");
    await page.waitForTimeout(120000); // 2 minuter

    // Ta screenshot efter väntan
    await page.screenshot({ path: "after-manual-login.png" });
    console.log("📸 Screenshot efter väntan sparad som after-manual-login.png");

    // Hämta cookies om användaren loggade in
    const cookies = await page.context().cookies();
    console.log(`🍪 Hittade ${cookies.length} cookies`);

    // Hämta aktuell URL
    const currentUrl = page.url();
    console.log(`🔗 Aktuell URL: ${currentUrl}`);

    // Hämta sidans text för att se om vi hittar V75-data
    const bodyText = document.body.innerText;
    console.log(`📝 Sidans text längd: ${bodyText.length} tecken`);

    // Sök efter hästdata
    const horsePattern = /\d+\s+([A-ZÅÄÖ][a-zåäö\s]+)/g;
    const horses: string[] = [];
    let match;
    while ((match = horsePattern.exec(bodyText)) !== null) {
      horses.push(match[1].trim());
    }

    // Sök efter strukna hästar
    const scratchedPattern = /(struken|avstängd|ej startar|startar inte)/gi;
    const scratchedMatches = bodyText.match(scratchedPattern);

    // Sök efter avdelningar
    const divisionPattern = /avdelning\s+(\d+)/gi;
    const divisions = [...bodyText.matchAll(divisionPattern)];

    console.log("");
    console.log("📊 RESULTAT EFTER MANUELL INLOGGNING:");
    console.log(`   🐎 Hästar hittade: ${horses.length}`);
    console.log(
      `   ❌ Strukna hästar: ${scratchedMatches ? scratchedMatches.length : 0}`
    );
    console.log(`   🏁 Avdelningar: ${divisions.length}`);
    console.log(`   🔗 URL: ${currentUrl}`);
    console.log(`   🍪 Cookies: ${cookies.length}`);

    if (horses.length > 0) {
      console.log("   🐎 Första hästarna:");
      horses.slice(0, 10).forEach((horse, index) => {
        console.log(`      ${index + 1}. ${horse}`);
      });
    }

    if (divisions.length > 0) {
      console.log("   🏁 Avdelningar hittade:");
      divisions.forEach((division) => {
        console.log(`      - Avdelning ${division[1]}`);
      });
    }

    console.log("");
    console.log("✅ Session slutförd!");
  } catch (error) {
    console.error("❌ Fel vid browser-öppning:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser stängd");
    }
  }
}

openBrowserForLogin();
