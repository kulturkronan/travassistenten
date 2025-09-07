import { chromium } from "playwright";

async function debugHTML() {
  console.log("Startar HTML-debugging av ATG-sidan...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const url = "https://www.atg.se/spel/2025-01-15/V75/solvalla/avd/1";
    console.log(`Laddar: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(5000);

    // Hämta all HTML för att analysera strukturen
    const html = await page.content();
    console.log("HTML-längd:", html.length);

    // Spara HTML till fil för analys
    const fs = await import("fs");
    fs.writeFileSync("debug-page.html", html);
    console.log("HTML sparad som debug-page.html");

    // Leta efter specifika mönster i HTML
    const patterns = [
      "horse",
      "start",
      "runner",
      "jockey",
      "driver",
      "trainer",
      "odds",
      "trend",
      "v75",
      "shoe",
      "skor",
    ];

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "gi");
      const matches = html.match(regex);
      console.log(
        `Pattern "${pattern}": ${matches ? matches.length : 0} träffar`
      );
    }

    // Leta efter tabeller
    const tables = await page.$$("table");
    console.log(`Antal tabeller: ${tables.length}`);

    for (let i = 0; i < tables.length; i++) {
      const tableHTML = await tables[i].innerHTML();
      console.log(
        `Tabell ${i + 1} HTML (första 200 tecken):`,
        tableHTML.substring(0, 200)
      );
    }

    // Leta efter divs med hästrelaterade klasser
    const horseDivs = await page.$$(
      '[class*="horse"], [class*="start"], [class*="runner"]'
    );
    console.log(`Antal hästrelaterade divs: ${horseDivs.length}`);

    for (let i = 0; i < Math.min(3, horseDivs.length); i++) {
      const divHTML = await horseDivs[i].innerHTML();
      console.log(
        `Div ${i + 1} HTML (första 300 tecken):`,
        divHTML.substring(0, 300)
      );
    }

    console.log("Browser öppen för manuell inspektion...");
    await page.waitForTimeout(15000);
  } catch (error) {
    console.error("Fel under debugging:", error);
  } finally {
    await browser.close();
  }
}

debugHTML().catch(console.error);
