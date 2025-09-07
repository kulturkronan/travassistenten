import { chromium } from "playwright";

async function testDebug() {
  console.log("Testar debug scraper...");

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

    // Sök efter hästdata
    console.log("Söker efter hästdata...");

    const horseRows = await page.$$('tr[class*="HorseTableRow"]');
    console.log(`Hittade ${horseRows.length} hästrader`);

    if (horseRows.length > 0) {
      console.log("Första hästrad:");
      const firstRow = horseRows[0];
      const text = await firstRow.innerText();
      console.log(text.substring(0, 500));
    }

    // Skapa enkel Markdown
    let markdown = `# V75 Startlista - 2025-09-06\n\n`;
    markdown += `**Bana:** Jägersro\n\n`;
    markdown += `**Datum:** 2025-09-06\n\n`;
    markdown += `---\n\n`;

    markdown += `## Avdelning 1\n\n`;
    markdown += `### Startlista\n\n`;
    markdown += `| Nr | Hästnamn | Kusk | Tränare | V75% | Trend | Odds | Skor |\n`;
    markdown += `|----|----------|------|---------|------|-------|------|------|\n`;

    for (let i = 0; i < Math.min(horseRows.length, 10); i++) {
      const row = horseRows[i];
      const text = await row.innerText();
      const lines = text.split("\n").filter((line: string) => line.trim());

      // Försök extrahera data från texten
      const horseNumber = lines[0]?.match(/\d+/)?.[0] || i + 1;
      const horseName = lines[1] || "Okänt";
      const driver = lines[2] || "Okänt";
      const trainer = lines[3] || "Okänt";
      const v75Percent = lines[4] || "N/A";
      const trend = lines[5] || "N/A";
      const odds = lines[6] || "N/A";
      const shoes = lines[7] || "N/A";

      markdown += `| ${horseNumber} | ${horseName} | ${driver} | ${trainer} | ${v75Percent} | ${trend} | ${odds} | ${shoes} |\n`;
    }

    // Spara Markdown
    const fs = await import("fs");
    fs.writeFileSync("V75_Startlista_Debug.md", markdown, "utf8");
    console.log("Markdown sparad som V75_Startlista_Debug.md");

    // Låt sidan vara öppen för manuell inspektion
    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error("Fel under test:", error);
  } finally {
    await browser.close();
  }
}

testDebug().catch(console.error);
