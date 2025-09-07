import { chromium } from "playwright";

async function testSpeltips() {
  console.log("Testar speltips-funktionalitet...");

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

    // Sök efter speltips-knapp
    console.log("Söker efter speltips-knapp...");

    const speltipsSelectors = [
      'button:has-text("Speltips")',
      'button:has-text("+ Speltips")',
      '[data-testid*="speltips"]',
      '[data-testid*="tips"]',
      'button[class*="speltips"]',
      'button[class*="tips"]',
      'button:contains("Speltips")',
      'button:contains("speltips")',
      'button:contains("Tips")',
      'button:contains("tips")',
      '[aria-label*="speltips"]',
      '[aria-label*="tips"]',
      '[title*="speltips"]',
      '[title*="tips"]',
      // Specifika selektorer för speltips-sektionen
      'div:has-text("Speltips") button',
      'div:has-text("Speltips") [class*="expand"]',
      'div:has-text("Speltips") [class*="collapse"]',
      'div:has-text("Speltips") [class*="toggle"]',
      // Leta efter + tecken nära speltips-text
      'div:has-text("Speltips") + button',
      'div:has-text("Speltips") ~ button',
      'div:has-text("Speltips") button:has-text("+")',
      'div:has-text("Speltips") [class*="plus"]',
      'div:has-text("Speltips") [class*="expand"]',
    ];

    let foundSpeltipsButton = false;
    for (const selector of speltipsSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`Hittade speltips-knapp: ${selector}`);
            await element.click();
            console.log("Klickade på speltips");
            await page.waitForTimeout(2000);
            foundSpeltipsButton = true;
            break;
          }
        }
      } catch (error) {
        // Ignorera fel
      }
    }

    if (!foundSpeltipsButton) {
      console.log("Ingen speltips-knapp hittades");
    }

    // Sök efter hästdata
    console.log("Söker efter hästdata...");

    const horseRows = await page.$$('tr[class*="HorseTableRow"]');
    console.log(`Hittade ${horseRows.length} hästrader`);

    // Sök efter speltips-data
    console.log("Söker efter speltips-data...");

    const speltipsElements = await page.$$(
      'div:has-text("Speltips"), div:has-text("Rank"), div:has-text("Spetsanalys")'
    );
    console.log(`Hittade ${speltipsElements.length} speltips-element`);

    for (let i = 0; i < Math.min(speltipsElements.length, 5); i++) {
      const element = speltipsElements[i];
      const text = await element.innerText();
      console.log(`Speltips-element ${i + 1}: ${text.substring(0, 200)}...`);
    }

    // Ta screenshot efter expandering
    await page.screenshot({ path: "speltips-test.png" });
    console.log("Screenshot sparad som speltips-test.png");

    // Spara HTML efter expandering
    const html = await page.content();
    const fs = await import("fs");
    fs.writeFileSync("speltips-test.html", html);
    console.log("HTML sparad som speltips-test.html");

    // Låt sidan vara öppen för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(15000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testSpeltips().catch(console.error);
