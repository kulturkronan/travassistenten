import { chromium } from "playwright";

async function testExpand() {
  console.log("Testar expand-funktionalitet...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = "https://www.atg.se/spel/2025-09-06/V75/jagersro/avd/1";
    console.log(`Laddar: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Hantera cookies
    console.log("Hanterar cookies...");
    await page.waitForTimeout(3000);

    const cookieSelectors = [
      "#onetrust-accept-btn-handler",
      "#onetrust-reject-all-handler",
      '[id*="accept"]',
      '[id*="cookie"]',
      'button[class*="accept"]',
      'button[class*="cookie"]',
      ".cookie-accept",
      ".accept-cookies",
      '[data-testid*="accept"]',
      '[data-testid*="cookie"]',
    ];

    for (const selector of cookieSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`Hittade cookies-knapp: ${selector}`);
            await element.click();
            console.log("Klickade på cookies-accept");
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch (error) {
        // Ignorera fel
      }
    }

    // Vänta på att React-appen laddas
    console.log("Väntar på React-app...");
    await page.waitForTimeout(8000);

    // Sök efter "Utöka alla" knapp
    console.log("Söker efter 'Utöka alla' knapp...");

    const expandSelectors = [
      'button:has-text("Utöka alla")',
      'button:has-text("+ Utöka alla")',
      '[data-testid*="expand"]',
      '[data-testid*="utöka"]',
      'button[class*="expand"]',
      'button[class*="utöka"]',
      'button:contains("Utöka")',
      'button:contains("utöka")',
      'button:contains("Expand")',
      'button:contains("expand")',
      '[aria-label*="utöka"]',
      '[aria-label*="expand"]',
      '[title*="utöka"]',
      '[title*="expand"]',
    ];

    let foundExpandButton = false;
    for (const selector of expandSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`Hittade "Utöka alla" knapp: ${selector}`);
            await element.click();
            console.log('Klickade på "Utöka alla"');
            await page.waitForTimeout(3000);
            foundExpandButton = true;
            break;
          }
        }
      } catch (error) {
        // Ignorera fel
      }
    }

    if (!foundExpandButton) {
      console.log('Ingen "Utöka alla" knapp hittades');
    }

    // Ta screenshot efter expandering
    await page.screenshot({ path: "after-expand.png" });
    console.log("Screenshot sparad som after-expand.png");

    // Sök efter hästdata efter expandering
    console.log("Söker efter hästdata efter expandering...");

    const horseSelectors = [
      '[class*="HorseTableRow"]',
      'tr[class*="HorseTableRow"]',
      '[data-test-id*="horse"]',
      '[class*="horse"]',
      "tr",
    ];

    for (const selector of horseSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✓ "${selector}": ${elements.length} element`);

          // Testa att läsa text från första elementet
          if (elements.length > 0) {
            const text = await elements[0].innerText();
            if (text && text.trim().length > 0) {
              console.log(`  Text: "${text.substring(0, 200)}..."`);
            }
          }
        }
      } catch (error) {
        // Ignorera fel
      }
    }

    // Spara HTML efter expandering
    const html = await page.content();
    const fs = await import("fs");
    fs.writeFileSync("after-expand.html", html);
    console.log("HTML sparad som after-expand.html");

    // Låt sidan vara öppen för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testExpand().catch(console.error);
