import { chromium } from "playwright";

async function testScraper() {
  console.log("Startar test av ATG-sidan...");

  const browser = await chromium.launch({ headless: false }); // Visa browser för debugging
  const page = await browser.newPage();

  try {
    // Testa en enkel ATG-sida
    const url = "https://www.atg.se/spel/2025-01-15/V75/solvalla/avd/1";
    console.log(`Laddar: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log("Sidan laddad, letar efter hästdata...");

    // Låt sidan ladda klart
    await page.waitForTimeout(5000);

    // Ta en screenshot för debugging
    await page.screenshot({ path: "debug-screenshot.png" });
    console.log("Screenshot sparad som debug-screenshot.png");

    // Leta efter olika selektorer
    const selectors = [
      '[data-test="startlist-row"]',
      ".StartListRow",
      ".startlist-row",
      ".horse-row",
      "tr[data-horse]",
      ".race-horse",
      "table tr",
      ".horse",
      '[class*="horse"]',
      '[class*="start"]',
    ];

    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        console.log(
          `Selector "${selector}": ${elements.length} element hittade`
        );

        if (elements.length > 0) {
          // Testa att läsa text från första elementet
          const text = await elements[0].innerText();
          console.log(`Första element text: "${text.substring(0, 100)}..."`);
        }
      } catch (error) {
        console.log(`Selector "${selector}": fel - ${error}`);
      }
    }

    // Låt sidan vara öppen en stund för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testScraper().catch(console.error);
