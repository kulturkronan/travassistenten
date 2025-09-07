// explore-web-api.js
// Använd Playwright för att logga in via webbgränssnittet och undersöka API-anrop

const { chromium } = require("playwright");

async function exploreWebAPI() {
  let browser;
  try {
    console.log(
      "🌐 Startar browser för att logga in via webbgränssnittet...\n"
    );

    browser = await chromium.launch({
      headless: false, // Visa browser för att se vad som händer
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Lyssna på alla network requests
    const apiCalls = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/") || url.includes("/services/")) {
        apiCalls.push({
          url: url,
          method: request.method(),
          headers: request.headers(),
        });
      }
    });

    // Gå till ATG:s startsida
    console.log("🔍 Går till ATG:s startsida...");
    await page.goto("https://www.atg.se");
    await page.waitForTimeout(2000);

    // Klicka på inloggning
    console.log("🔐 Klickar på inloggning...");
    try {
      await page.click("text=Logga in");
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log(
        "⚠️ Kunde inte hitta inloggningsknapp, försöker andra sätt..."
      );
      // Försök andra sätt att hitta inloggning
      const loginSelectors = [
        'a[href*="login"]',
        'button:has-text("Logga in")',
        '[data-testid*="login"]',
        ".login",
        "#login",
      ];

      for (const selector of loginSelectors) {
        try {
          await page.click(selector);
          await page.waitForTimeout(1000);
          break;
        } catch (e) {
          // Fortsätt med nästa selector
        }
      }
    }

    // Fyll i inloggningsuppgifter
    console.log("📝 Fyller i inloggningsuppgifter...");
    try {
      await page.fill(
        'input[name="username"], input[name="email"], input[type="email"]',
        "jesSjo680"
      );
      await page.fill(
        'input[name="password"], input[type="password"]',
        "Jeppe1599"
      );
      await page.waitForTimeout(1000);

      // Klicka på inloggningsknapp
      await page.click(
        'button[type="submit"], button:has-text("Logga in"), input[type="submit"]'
      );
      await page.waitForTimeout(3000);

      console.log("✅ Inloggning genomförd!");
    } catch (error) {
      console.log("⚠️ Kunde inte fylla i inloggningsformulär:", error.message);
    }

    // Gå till V75-sidan
    console.log("🏇 Går till V75-sidan...");
    try {
      await page.goto("https://www.atg.se/spel/2025-09-06/V75/jagersro");
      await page.waitForTimeout(3000);

      console.log("✅ V75-sidan laddad!");

      // Klicka på första avdelningen för att se detaljerad data
      console.log("🔍 Klickar på första avdelningen...");
      try {
        await page.click(
          'a[href*="avd/1"], [data-testid*="division-1"], .division-1'
        );
        await page.waitForTimeout(2000);

        console.log("✅ Första avdelningen laddad!");

        // Klicka på en häst för att se detaljerad data
        console.log("🐎 Klickar på första hästen...");
        try {
          await page.click('[data-testid*="horse"], .horse-row, tr:has(td)');
          await page.waitForTimeout(2000);

          console.log("✅ Hästdetaljer laddade!");
        } catch (error) {
          console.log("⚠️ Kunde inte klicka på häst:", error.message);
        }
      } catch (error) {
        console.log("⚠️ Kunde inte klicka på avdelning:", error.message);
      }
    } catch (error) {
      console.log("⚠️ Kunde inte ladda V75-sidan:", error.message);
    }

    // Visa alla API-anrop som gjordes
    console.log("\n📊 API-anrop som gjordes:");
    console.log(`Totalt ${apiCalls.length} API-anrop hittades:`);

    for (let i = 0; i < apiCalls.length; i++) {
      const call = apiCalls[i];
      console.log(`\n${i + 1}. ${call.method} ${call.url}`);

      // Visa headers som kan vara viktiga
      const importantHeaders = [
        "authorization",
        "cookie",
        "x-auth-token",
        "x-api-key",
      ];
      const relevantHeaders = Object.entries(call.headers)
        .filter(([key, value]) => importantHeaders.includes(key.toLowerCase()))
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      if (Object.keys(relevantHeaders).length > 0) {
        console.log(`   Headers:`, relevantHeaders);
      }
    }

    // Vänta lite för att se resultatet
    console.log("\n⏳ Väntar 5 sekunder för att se resultatet...");
    await page.waitForTimeout(5000);
  } catch (error) {
    console.log(`💥 Fel: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

exploreWebAPI();
