import { chromium } from "playwright";

async function testSpeltipsSimple() {
  console.log("Testar enkel speltips-funktionalitet...");

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
    await page.waitForTimeout(10000);

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

    // Vänta lite extra för att speltips ska laddas
    console.log("Väntar på att speltips ska laddas...");
    await page.waitForTimeout(5000);

    // Sök efter speltips-knapp med mer specifika selektorer
    console.log("Söker efter speltips-knapp...");

    // Låt oss först hitta alla element som innehåller "Speltips"
    const speltipsElements = await page.$$('*:has-text("Speltips")');
    console.log(
      `Hittade ${speltipsElements.length} element som innehåller "Speltips"`
    );

    for (let i = 0; i < Math.min(speltipsElements.length, 10); i++) {
      const element = speltipsElements[i];
      const tagName = await element.evaluate((el) => el.tagName);
      const className = await element.getAttribute("class");
      const text = await element.innerText();
      console.log(
        `Element ${
          i + 1
        }: ${tagName}, class: ${className}, text: ${text.substring(0, 100)}...`
      );
    }

    // Låt oss också söka efter knappar som innehåller "+"
    const plusButtons = await page.$$('button:has-text("+")');
    console.log(`Hittade ${plusButtons.length} knappar som innehåller "+"`);

    for (let i = 0; i < Math.min(plusButtons.length, 5); i++) {
      const element = plusButtons[i];
      const text = await element.innerText();
      const className = await element.getAttribute("class");
      console.log(`Plus-knapp ${i + 1}: "${text}", class: ${className}`);
    }

    // Ta screenshot
    await page.screenshot({ path: "speltips-simple-test.png" });
    console.log("Screenshot sparad som speltips-simple-test.png");

    // Låt sidan vara öppen för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(20000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testSpeltipsSimple().catch(console.error);
