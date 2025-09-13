import { chromium, Browser, Page } from "playwright";

async function manualLoginSession() {
  let browser: Browser | null = null;

  try {
    console.log("🎯 MANUELL INLOGGNINGSSESSION");
    console.log("================================");
    console.log("📋 Instruktioner:");
    console.log("   1. En browser öppnas nu");
    console.log("   2. Logga in med: jesSjo680 / Jeppe1599");
    console.log("   3. När du är inloggad, tryck ENTER i denna terminal");
    console.log("   4. Jag kommer att spåra processen och hämta V75-data");
    console.log("");

    browser = await chromium.launch({
      headless: false, // VIKTIGT: Visa browser
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
    console.log("⏳ Väntar på att du ska logga in...");
    console.log("   (Tryck ENTER när du är klar med inloggningen)");

    // Vänta på användarinput
    await new Promise((resolve) => {
      process.stdin.once("data", () => {
        console.log("✅ Användaren har tryckt ENTER - fortsätter...");
        resolve(void 0);
      });
    });

    // Ta screenshot efter inloggning
    await page.screenshot({ path: "after-login.png" });
    console.log("📸 Screenshot efter inloggning sparad som after-login.png");

    // Hämta cookies
    const cookies = await page.context().cookies();
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    console.log(`🍪 Hittade ${cookies.length} cookies`);

    // Hämta user agent
    const userAgent = await page.evaluate(() => navigator.userAgent);

    // Navigera till V75-sidan
    console.log("🏇 Navigerar till V75-sidan...");
    await page.goto("https://www.atg.se/spel/v75", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Vänta på att sidan laddas
    await page.waitForTimeout(5000);

    // Ta screenshot av V75-sidan
    await page.screenshot({ path: "v75-page-with-login.png" });
    console.log("📸 Screenshot av V75-sida sparad som v75-page-with-login.png");

    // Hämta V75-data
    console.log("🔍 Hämtar V75-data...");
    const v75Data = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      console.log(`📝 Body text längd: ${bodyText.length} tecken`);

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

      return {
        horsesFound: horses.length,
        scratchedFound: scratchedMatches ? scratchedMatches.length : 0,
        divisionsFound: divisions.length,
        bodyTextLength: bodyText.length,
        horses: horses.slice(0, 20), // Första 20 hästarna
        divisions: divisions.map((d) => d[1]),
      };
    });

    console.log("📊 V75-DATA RESULTAT:");
    console.log(`   🐎 Hästar hittade: ${v75Data.horsesFound}`);
    console.log(`   ❌ Strukna hästar: ${v75Data.scratchedFound}`);
    console.log(`   🏁 Avdelningar: ${v75Data.divisionsFound}`);
    console.log(`   📝 Text längd: ${v75Data.bodyTextLength}`);

    if (v75Data.horses.length > 0) {
      console.log("   🐎 Första hästarna:");
      v75Data.horses.forEach((horse, index) => {
        console.log(`      ${index + 1}. ${horse}`);
      });
    }

    if (v75Data.divisions.length > 0) {
      console.log("   🏁 Avdelningar hittade:");
      v75Data.divisions.forEach((division) => {
        console.log(`      - Avdelning ${division}`);
      });
    }

    console.log("");
    console.log("✅ Session slutförd!");
    console.log("📁 Screenshots sparade:");
    console.log("   - after-login.png");
    console.log("   - v75-page-with-login.png");
  } catch (error) {
    console.error("❌ Fel vid manuell inloggning:", error);
  } finally {
    console.log("🔒 Stänger browser om 10 sekunder...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    if (browser) {
      await browser.close();
      console.log("✅ Browser stängd");
    }
  }
}

manualLoginSession();
