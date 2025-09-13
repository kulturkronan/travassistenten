import { chromium, Browser, Page } from "playwright";

async function extendedBrowserSession() {
  let browser: Browser | null = null;

  try {
    console.log("🎯 FÖRLÄNGD BROWSER-SESSION FÖR V75-DATA");
    console.log("==========================================");
    console.log("📋 Instruktioner:");
    console.log("   1. En browser öppnas nu");
    console.log("   2. Logga in med: jesSjo680 / Jeppe1599");
    console.log("   3. Navigera till V75-sidan");
    console.log("   4. Kolla ALLA avdelningar (1-7) för strukna hästar");
    console.log("   5. Klicka på varje häst för att se historisk data");
    console.log("   6. Browser stängs automatiskt efter 10 minuter");
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
    console.log("📋 VAD DU SKA GÖRA:");
    console.log("   1. Logga in med uppgifterna ovan");
    console.log("   2. Gå till V75-sidan (https://www.atg.se/spel/v75)");
    console.log("   3. Kolla ALLA avdelningar (1-7) för strukna hästar");
    console.log("   4. Klicka på varje häst för att se:");
    console.log("      - Tidigare starter (historik)");
    console.log("      - Statistik");
    console.log("      - Kommentarer");
    console.log("   5. Anteckna vilka hästar som är strukna i varje avdelning");
    console.log("   6. Anteckna historisk data för hästarna");
    console.log("");

    // Ta screenshot av inloggningssidan
    await page.screenshot({ path: "login-page-extended.png" });
    console.log("📸 Screenshot sparad som login-page-extended.png");

    // Vänta 10 minuter för att du ska kunna logga in och utforska
    console.log(
      "⏳ Väntar 10 minuter för manuell inloggning och data-insamling..."
    );
    console.log("   (Du har nu 10 minuter att logga in och samla in all data)");

    // Ta screenshot var 2:e minut för att spåra framsteg
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(120000); // 2 minuter
      const currentUrl = page.url();
      await page.screenshot({ path: `progress-${i + 1}.png` });
      console.log(`📸 Screenshot ${i + 1}/5 sparad som progress-${i + 1}.png`);
      console.log(`   Aktuell URL: ${currentUrl}`);
    }

    // Ta final screenshot
    await page.screenshot({ path: "final-session.png" });
    console.log("📸 Final screenshot sparad som final-session.png");

    // Hämta cookies om användaren loggade in
    const cookies = await page.context().cookies();
    console.log(`🍪 Hittade ${cookies.length} cookies`);

    // Hämta aktuell URL
    const currentUrl = page.url();
    console.log(`🔗 Aktuell URL: ${currentUrl}`);

    // Hämta sidans text för att se om vi hittar V75-data
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

      // Sök efter hästnamn med mer detaljerad parsing
      const detailedHorsePattern =
        /(\d+)\s+([A-ZÅÄÖ][a-zåäö\s]+)\s+([A-ZÅÄÖ][a-zåäö\s]+)/g;
      const detailedHorses: { number: string; name: string; driver: string }[] =
        [];
      let detailedMatch;
      while ((detailedMatch = detailedHorsePattern.exec(bodyText)) !== null) {
        detailedHorses.push({
          number: detailedMatch[1],
          name: detailedMatch[2],
          driver: detailedMatch[3],
        });
      }

      return {
        horsesFound: horses.length,
        detailedHorsesFound: detailedHorses.length,
        scratchedFound: scratchedMatches ? scratchedMatches.length : 0,
        divisionsFound: divisions.length,
        bodyTextLength: bodyText.length,
        horses: horses.slice(0, 50), // Första 50 hästarna
        detailedHorses: detailedHorses.slice(0, 20), // Första 20 detaljerade hästarna
        divisions: divisions.map((d) => d[1]),
        hasV75Data: bodyText.includes("V75") || bodyText.includes("avdelning"),
        hasHorseData: horses.length > 0,
      };
    });

    console.log("");
    console.log("📊 RESULTAT EFTER FÖRLÄNGD SESSION:");
    console.log(`   🐎 Hästar hittade: ${v75Data.horsesFound}`);
    console.log(`   🐎 Detaljerade hästar: ${v75Data.detailedHorsesFound}`);
    console.log(`   ❌ Strukna hästar: ${v75Data.scratchedFound}`);
    console.log(`   🏁 Avdelningar: ${v75Data.divisionsFound}`);
    console.log(`   🔗 URL: ${currentUrl}`);
    console.log(`   🍪 Cookies: ${cookies.length}`);
    console.log(`   📝 Text längd: ${v75Data.bodyTextLength}`);
    console.log(`   🎯 V75-data: ${v75Data.hasV75Data ? "Ja" : "Nej"}`);
    console.log(`   🐎 Hästdata: ${v75Data.hasHorseData ? "Ja" : "Nej"}`);

    if (v75Data.horses.length > 0) {
      console.log("   🐎 Första hästarna:");
      v75Data.horses.slice(0, 20).forEach((horse, index) => {
        console.log(`      ${index + 1}. ${horse}`);
      });
    }

    if (v75Data.detailedHorses.length > 0) {
      console.log("   🐎 Detaljerade hästar (nummer, namn, kusk):");
      v75Data.detailedHorses.forEach((horse, index) => {
        console.log(
          `      ${index + 1}. ${horse.number} - ${horse.name} - ${
            horse.driver
          }`
        );
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
    console.log("   - login-page-extended.png");
    console.log("   - progress-1.png till progress-5.png");
    console.log("   - final-session.png");
  } catch (error) {
    console.error("❌ Fel vid förlängd browser-session:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser stängd");
    }
  }
}

extendedBrowserSession();
