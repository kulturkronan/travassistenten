import { chromium } from "playwright";

async function testReactApp() {
  console.log("Testar React-app laddning...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = "https://www.atg.se/spel/2025-01-15/V75/solvalla/avd/1";
    console.log(`Laddar: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Vänta på att React-appen laddas
    console.log("Väntar på React-app...");
    await page.waitForTimeout(10000);

    // Vänta på specifika element som indikerar att appen laddats
    try {
      await page.waitForSelector(
        '[data-testid], [class*="race"], [class*="startlist"], [class*="horse"]',
        {
          timeout: 15000,
        }
      );
      console.log("React-app verkar ha laddats");
    } catch (error) {
      console.log("Inga specifika element hittades, fortsätter ändå...");
    }

    // Ta screenshot
    await page.screenshot({ path: "react-loaded.png" });
    console.log("Screenshot sparad som react-loaded.png");

    // Låt sidan ladda klart
    await page.waitForTimeout(5000);

    // Sök efter alla möjliga selektorer
    const allSelectors = [
      // Data attributes
      '[data-testid*="horse"]',
      '[data-testid*="start"]',
      '[data-testid*="race"]',
      '[data-testid*="runner"]',

      // Class-based selectors
      '[class*="horse"]',
      '[class*="start"]',
      '[class*="race"]',
      '[class*="runner"]',
      '[class*="entry"]',
      '[class*="participant"]',

      // Generic selectors
      'div[role="row"]',
      'div[role="listitem"]',
      'li[role="listitem"]',
      "tr",
      'div[class*="row"]',
      'div[class*="item"]',

      // ATG-specific patterns
      '[class*="StartList"]',
      '[class*="RaceCard"]',
      '[class*="HorseCard"]',
      '[class*="Entry"]',
      '[class*="Participant"]',
    ];

    console.log("Söker efter hästdata...");
    let foundElements = 0;

    for (const selector of allSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✓ "${selector}": ${elements.length} element`);
          foundElements += elements.length;

          // Testa att läsa text från första elementet
          if (elements.length > 0) {
            const text = await elements[0].innerText();
            if (text && text.trim().length > 0) {
              console.log(`  Text: "${text.substring(0, 100)}..."`);
            }
          }
        }
      } catch (error) {
        // Ignorera fel
      }
    }

    console.log(`Totalt ${foundElements} element hittade`);

    // Spara HTML igen efter att React laddats
    const html = await page.content();
    const fs = await import("fs");
    fs.writeFileSync("react-loaded.html", html);
    console.log("HTML efter React-laddning sparad som react-loaded.html");

    // Låt sidan vara öppen för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(20000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testReactApp().catch(console.error);
