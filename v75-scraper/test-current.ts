import { chromium } from "playwright";

async function testCurrentURL() {
  console.log("Testar aktuell URL med cookies-hantering...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = "https://www.atg.se/spel/2025-09-06/V75/jagersro/avd/1";
    console.log(`Laddar: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Hantera cookies-rutan
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

    // Ta screenshot
    await page.screenshot({ path: "current-test.png" });
    console.log("Screenshot sparad som current-test.png");

    // Sök efter hästdata
    const allSelectors = [
      '[data-testid*="horse"]',
      '[data-testid*="start"]',
      '[data-testid*="race"]',
      '[data-testid*="runner"]',
      '[class*="horse"]',
      '[class*="start"]',
      '[class*="race"]',
      '[class*="runner"]',
      '[class*="entry"]',
      '[class*="participant"]',
      'div[role="row"]',
      'div[role="listitem"]',
      'li[role="listitem"]',
      "tr",
      'div[class*="row"]',
      'div[class*="item"]',
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
              console.log(`  Text: "${text.substring(0, 150)}..."`);
            }
          }
        }
      } catch (error) {
        // Ignorera fel
      }
    }

    console.log(`Totalt ${foundElements} element hittade`);

    // Spara HTML
    const html = await page.content();
    const fs = await import("fs");
    fs.writeFileSync("current-test.html", html);
    console.log("HTML sparad som current-test.html");

    // Låt sidan vara öppen för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testCurrentURL().catch(console.error);
