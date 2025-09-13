const { chromium } = require("playwright");
const {
  fetchV75GameId,
  fetchV75Game,
  generateV75ResultMarkdown,
  generateV75StartlistMarkdown,
} = require("./atg");
const {
  getHorseHistory,
  fetchGame,
  getV75HorseHistory,
  fetchHorseDetails,
  extractHistoryFromHorseDetails,
} = require("./atg-history");

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/**
 * Hämta hästhistorik via web scraping
 */
async function scrapeHorseHistory(raceUrl) {
  let browser;
  try {
    console.log("🌐 Startar web scraping för hästhistorik...");

    browser = await chromium.launch({
      headless: false, // Synlig för debugging
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    const page = await context.newPage();

    // Gå till första avdelningen
    const firstDivisionUrl = `${raceUrl}/avd/1`;
    console.log(`🌐 Går till ${firstDivisionUrl}...`);

    await page.goto(firstDivisionUrl, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Acceptera cookies
    try {
      await page.waitForSelector('button:has-text("Godkänn alla cookies")', {
        timeout: 10000,
      });
      await page.click('button:has-text("Godkänn alla cookies")');
      console.log("✅ Cookies accepterade");
    } catch (error) {
      console.log("ℹ️ Inga cookies att acceptera");
    }

    // Klicka på "Utöka alla" för att visa all data
    try {
      console.log("🔍 Letar efter 'Utöka alla' knapp...");
      await page.waitForTimeout(3000);

      const expandSelectors = [
        'button:has-text("Utöka alla")',
        '[data-test-id="change-startlist-view"]',
        'button[class*="expandAll"]',
        'button:has-text("Expand all")',
        'button:has-text("Visa alla")',
        'button:has-text("Expandera")',
      ];

      let expandClicked = false;
      for (const selector of expandSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.click(selector);
          expandClicked = true;
          console.log(`✅ Klickade på 'Utöka alla' med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte klicka på 'Utöka alla' med ${selector}`);
        }
      }

      if (!expandClicked) {
        // Försök med JavaScript-klick som fallback
        console.log("🔄 Försöker med JavaScript-klick...");
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const expandButton = buttons.find(
            (btn) =>
              btn.textContent.includes("Utöka alla") ||
              btn.textContent.includes("Expand all") ||
              btn.textContent.includes("Visa alla")
          );
          if (expandButton) {
            expandButton.click();
            return true;
          }
          return false;
        });
        console.log("✅ JavaScript-klick utfört");
      }

      // Vänta på att data ska ladda
      await page.waitForTimeout(8000);
      console.log("✅ 'Utöka alla' process slutförd");
    } catch (error) {
      console.log("⚠️ Kunde inte klicka på 'Utöka alla':", error.message);
    }

    // Extrahera hästhistorik för alla avdelningar
    const horseHistory = {};

    for (let division = 1; division <= 7; division++) {
      if (division > 1) {
        const divisionUrl = `${raceUrl}/avd/${division}`;
        console.log(`🌐 Går till avdelning ${division}...`);
        await page.goto(divisionUrl, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        await page.waitForTimeout(2000);
      }

      console.log(`🔍 Extraherar hästhistorik för avdelning ${division}...`);
      const divisionHistory = await page.evaluate(() => {
        const history = {};

        console.log("🔍 Letar efter hästhistorik-tabeller...");

        // Hitta alla tabeller som kan innehålla hästhistorik
        const allTables = document.querySelectorAll("table");
        console.log(`Hittade ${allTables.length} tabeller totalt`);

        // Leta specifikt efter "Senaste 5 starterna" eller liknande
        const historyTables = [];
        allTables.forEach((table, index) => {
          const tableText = table.textContent.toLowerCase();
          if (
            tableText.includes("senaste") ||
            tableText.includes("starter") ||
            tableText.includes("historik") ||
            tableText.includes("datum") ||
            tableText.includes("bana") ||
            tableText.includes("plac")
          ) {
            historyTables.push(table);
            console.log(
              `Tabell ${index + 1}: ${tableText.substring(0, 100)}...`
            );
          }
        });

        console.log(
          `Hittade ${historyTables.length} potentiella hästhistorik-tabeller`
        );

        // Försök att extrahera data från varje tabell
        historyTables.forEach((table, tableIndex) => {
          console.log(`Bearbetar tabell ${tableIndex + 1}...`);

          const rows = table.querySelectorAll("tr");
          console.log(`Tabell ${tableIndex + 1} har ${rows.length} rader`);

          // Hitta header-raden för att förstå kolumnstrukturen
          let headerRow = null;
          let dataRows = [];

          rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll("td, th");
            const cellTexts = Array.from(cells).map((cell) =>
              cell.textContent.trim()
            );

            // Kolla om detta är en header-rad
            if (
              cellTexts.some(
                (text) =>
                  text.toLowerCase().includes("datum") ||
                  text.toLowerCase().includes("bana") ||
                  text.toLowerCase().includes("kusk") ||
                  text.toLowerCase().includes("plac") ||
                  text.toLowerCase().includes("distans")
              )
            ) {
              headerRow = row;
              console.log(
                `Header-rad ${rowIndex + 1}: ${cellTexts.join(" | ")}`
              );
            } else if (
              cells.length >= 3 &&
              cellTexts.some((text) => text.match(/^\d{4}-\d{2}-\d{2}$/))
            ) {
              // Detta ser ut som en data-rad med datum
              dataRows.push(row);
            }
          });

          console.log(
            `Hittade ${dataRows.length} data-rader i tabell ${tableIndex + 1}`
          );

          // Extrahera data från data-raderna
          dataRows.forEach((row, dataIndex) => {
            const cells = row.querySelectorAll("td, th");
            const cellTexts = Array.from(cells).map((cell) =>
              cell.textContent.trim()
            );

            if (cellTexts.length >= 4) {
              const horseNumber = dataIndex + 1; // Antag att varje rad är en häst

              if (!history[horseNumber]) {
                history[horseNumber] = [];
              }

              const historyEntry = {
                date: cellTexts[0] || "",
                track: cellTexts[1] || "",
                driver: cellTexts[2] || "",
                position: cellTexts[3] || "",
                distance: cellTexts[4] || "",
                kmTime: cellTexts[5] || "",
                shoes: cellTexts[6] || "",
                odds: cellTexts[7] || "",
                price: cellTexts[8] || "",
                wagon: cellTexts[9] || "",
                anm: cellTexts[10] || "",
                video: cellTexts[11] || "",
                comment: cellTexts[12] || "",
              };

              history[horseNumber].push(historyEntry);
              console.log(
                `Häst ${horseNumber} rad ${dataIndex + 1}: ${cellTexts
                  .slice(0, 4)
                  .join(" | ")}`
              );
            }
          });
        });

        // Begränsa till max 5 starter per häst
        Object.keys(history).forEach((horseNumber) => {
          history[horseNumber] = history[horseNumber].slice(0, 5);
        });

        console.log(
          `Slutresultat: ${Object.keys(history).length} hästar med historik`
        );
        return history;
      });

      horseHistory[division] = divisionHistory;
    }

    return horseHistory;
  } catch (error) {
    console.log("💥 Fel vid web scraping av hästhistorik:", error.message);
    return {};
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Hämta kompletterande data via inloggad web scraping
 */
async function scrapeAdditionalData(raceUrl) {
  let browser;
  try {
    console.log("🌐 Startar inloggad web scraping för kompletterande data...");

    browser = await chromium.launch({
      headless: false, // Synlig för debugging
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    const page = await context.newPage();

    // Gå till första avdelningen
    const firstDivisionUrl = `${raceUrl}/avd/1`;
    console.log(`🌐 Går till ${firstDivisionUrl}...`);

    await page.goto(firstDivisionUrl, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Acceptera cookies
    try {
      await page.waitForSelector('button:has-text("Godkänn alla cookies")', {
        timeout: 10000,
      });
      await page.click('button:has-text("Godkänn alla cookies")');
      console.log("✅ Cookies accepterade");
    } catch (error) {
      console.log("ℹ️ Inga cookies att acceptera");
    }

    // Logga in
    try {
      console.log("🔐 Loggar in...");

      // Vänta lite extra på att sidan ska ladda
      await page.waitForTimeout(3000);

      // Försök att klicka på "Logga in" med flera olika selektorer
      const loginSelectors = [
        'button:has-text("Logga in")',
        '[data-test-id="login"]',
        'button[class*="login"]',
        'a:has-text("Logga in")',
      ];

      let loginClicked = false;
      for (const selector of loginSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.click(selector);
          loginClicked = true;
          console.log(`✅ Klickade på inloggning med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte klicka med ${selector}`);
        }
      }

      if (!loginClicked) {
        throw new Error("Kunde inte hitta inloggningsknapp");
      }

      // Vänta på att modalen ska öppnas
      await page.waitForSelector(
        '[data-test-id="login-modal"], .MuiModal-root, [role="dialog"]',
        {
          timeout: 15000,
        }
      );
      console.log("✅ Inloggningsmodal öppnad");

      // Klicka på "Lösenord" med flera olika selektorer
      const passwordSelectors = [
        'button:has-text("Lösenord")',
        '[data-test-id="password-tab"]',
        'button[class*="password"]',
        'button:has-text("Password")',
      ];

      let passwordClicked = false;
      for (const selector of passwordSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          passwordClicked = true;
          console.log(`✅ Klickade på lösenord med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte klicka på lösenord med ${selector}`);
        }
      }

      // Vänta lite extra
      await page.waitForTimeout(2000);

      // Fyll i användarnamn med flera olika selektorer
      const usernameSelectors = [
        'input[name="username"]',
        'input[type="text"]',
        'input[placeholder*="användarnamn"]',
        'input[placeholder*="username"]',
      ];

      for (const selector of usernameSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.fill(selector, "jesSjo680");
          console.log(`✅ Fyllde i användarnamn med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte fylla användarnamn med ${selector}`);
        }
      }

      // Fyll i lösenord med flera olika selektorer
      const passwordInputSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="lösenord"]',
        'input[placeholder*="password"]',
      ];

      for (const selector of passwordInputSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.fill(selector, "Jeppe1599");
          console.log(`✅ Fyllde i lösenord med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte fylla lösenord med ${selector}`);
        }
      }

      // Klicka på Logga in med flera olika selektorer
      const submitSelectors = [
        'button:has-text("Logga in")',
        'button[type="submit"]',
        'button[class*="submit"]',
        'button:has-text("Login")',
      ];

      for (const selector of submitSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          console.log(`✅ Klickade på logga in med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte klicka logga in med ${selector}`);
        }
      }

      // Vänta på att inloggningen ska slutföras
      await page.waitForTimeout(5000);
      console.log("✅ Inloggning slutförd");
    } catch (error) {
      console.log("⚠️ Inloggning misslyckades:", error.message);
    }

    // Klicka på "Utöka alla" för att visa all data
    try {
      console.log("🔍 Letar efter 'Utöka alla' knapp...");

      // Vänta lite extra på att sidan ska ladda
      await page.waitForTimeout(3000);

      // Försök att hitta "Utöka alla" knappen med flera olika selektorer
      const expandSelectors = [
        'button:has-text("Utöka alla")',
        '[data-test-id="change-startlist-view"]',
        'button[class*="expandAll"]',
        'button:has-text("Expand all")',
        'button:has-text("Visa alla")',
        'button:has-text("Expandera")',
      ];

      let expandClicked = false;
      for (const selector of expandSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.click(selector);
          expandClicked = true;
          console.log(`✅ Klickade på 'Utöka alla' med: ${selector}`);
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte klicka på 'Utöka alla' med ${selector}`);
        }
      }

      if (!expandClicked) {
        // Försök med JavaScript-klick som fallback
        console.log("🔄 Försöker med JavaScript-klick...");
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const expandButton = buttons.find(
            (btn) =>
              btn.textContent.includes("Utöka alla") ||
              btn.textContent.includes("Expand all") ||
              btn.textContent.includes("Visa alla")
          );
          if (expandButton) {
            expandButton.click();
            return true;
          }
          return false;
        });
        console.log("✅ JavaScript-klick utfört");
      }

      // Vänta på att data ska ladda
      await page.waitForTimeout(8000);
      console.log("✅ 'Utöka alla' process slutförd");
    } catch (error) {
      console.log("⚠️ Kunde inte klicka på 'Utöka alla':", error.message);
    }

    // Extrahera kompletterande data för alla avdelningar
    const additionalData = {};

    for (let division = 1; division <= 7; division++) {
      if (division > 1) {
        const divisionUrl = `${raceUrl}/avd/${division}`;
        console.log(`🌐 Går till avdelning ${division}...`);
        await page.goto(divisionUrl, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        await page.waitForTimeout(2000);
      }

      console.log(`🔍 Extraherar data för avdelning ${division}...`);
      const divisionData = await page.evaluate(() => {
        const data = {};

        console.log("🔍 Letar efter hästdata i utökad startlista...");

        // Hitta alla hästrader i den utökade startlistan
        const horseRows = document.querySelectorAll(
          '[data-test-id="horse-row"], .horse-row, [class*="horse-row"]'
        );
        console.log(`Hittade ${horseRows.length} hästrader`);

        // Filtrera bort header-rader och fokusera på data-rader
        const dataRows = Array.from(horseRows).filter((row) => {
          const text = row.textContent.toLowerCase();
          // Exkludera header-rader som innehåller "HÄST/KUSK" eller "DATUM"
          return (
            !text.includes("häst/kusk") &&
            !text.includes("datum") &&
            !text.includes("v75%") &&
            !text.includes("trend%") &&
            text.length > 50
          ); // Måste ha tillräckligt med innehåll
        });

        console.log(`Filtrerade till ${dataRows.length} data-rader`);

        // Försök att extrahera data från varje hästrad
        dataRows.forEach((row, index) => {
          const horseNumber = index + 1;
          const horseData = {};

          console.log(`Bearbetar häst ${horseNumber}...`);

          // Hitta alla celler i raden
          const cells = row.querySelectorAll('td, th, [class*="cell"]');
          console.log(`  Hittade ${cells.length} celler`);

          // Debug: Visa innehållet i varje cell
          cells.forEach((cell, cellIndex) => {
            const text = cell.textContent.trim();
            if (text && text.length > 0) {
              console.log(`    Cell ${cellIndex}: "${text}"`);
            }
          });

          // Extrahera data baserat på cellposition (vi vet att kolumnerna är i ordning)
          if (cells.length >= 11) {
            // Vi behöver minst 11 kolumner
            // Kolumn 5: Tränare
            if (cells[5] && cells[5].textContent.trim()) {
              horseData.trainer = cells[5].textContent.trim();
              console.log(`  Tränare: ${horseData.trainer}`);
            }

            // Kolumn 9: Skor
            if (cells[9] && cells[9].textContent.trim()) {
              horseData.shoes = cells[9].textContent.trim();
              console.log(`  Skor: ${horseData.shoes}`);
            }

            // Kolumn 10: Vagn
            if (cells[10] && cells[10].textContent.trim()) {
              horseData.wagon = cells[10].textContent.trim();
              console.log(`  Vagn: ${horseData.wagon}`);
            }

            // Kolumn 6: Tipskommentar
            if (cells[6] && cells[6].textContent.trim()) {
              horseData.comment = cells[6].textContent.trim();
              console.log(`  Kommentar: ${horseData.comment}`);
            }
          } else {
            console.log(
              `  Inte tillräckligt med celler (${cells.length} < 11)`
            );
          }

          // Fallback: leta efter specifika element inom raden
          if (Object.keys(horseData).length === 0) {
            console.log(`  Fallback: letar efter specifika element...`);

            // Leta efter tränare
            const trainerElements = row.querySelectorAll(
              '[class*="trainer"], [class*="Trainer"], [data-test-id*="trainer"]'
            );
            if (trainerElements.length > 0) {
              horseData.trainer = trainerElements[0].textContent.trim();
              console.log(`  Tränare (fallback): ${horseData.trainer}`);
            }

            // Leta efter skor
            const shoesElements = row.querySelectorAll(
              '[class*="shoes"], [class*="Shoes"], [class*="skor"], [data-test-id*="shoes"]'
            );
            if (shoesElements.length > 0) {
              horseData.shoes = shoesElements[0].textContent.trim();
              console.log(`  Skor (fallback): ${horseData.shoes}`);
            }

            // Leta efter vagn
            const wagonElements = row.querySelectorAll(
              '[class*="wagon"], [class*="Wagon"], [class*="vagn"], [data-test-id*="wagon"]'
            );
            if (wagonElements.length > 0) {
              horseData.wagon = wagonElements[0].textContent.trim();
              console.log(`  Vagn (fallback): ${horseData.wagon}`);
            }

            // Leta efter kommentar
            const commentElements = row.querySelectorAll(
              '[class*="comment"], [class*="Comment"], [class*="tip"], [data-test-id*="comment"]'
            );
            if (commentElements.length > 0) {
              horseData.comment = commentElements[0].textContent.trim();
              console.log(`  Kommentar (fallback): ${horseData.comment}`);
            }
          }

          if (Object.keys(horseData).length > 0) {
            data[horseNumber] = horseData;
            console.log(`Häst ${horseNumber} data:`, horseData);
          }
        });

        console.log(
          `Slutresultat: ${Object.keys(data).length} hästar med data`
        );
        return data;
      });

      additionalData[division] = divisionData;
    }

    return additionalData;
  } catch (error) {
    console.log("💥 Fel vid web scraping:", error.message);
    return {};
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Hämta hästhistorik via kombination av web scraping (datum) + API (detaljer)
 */
async function scrapeHorseHistory(raceUrl) {
  let browser;
  try {
    console.log(
      "🌐 Startar hybrid approach: web scraping för datum + API för detaljer..."
    );

    browser = await chromium.launch({
      headless: false, // Kör med synlig webbläsare så du kan se vad som händer
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });

    const page = await context.newPage();

    // Steg 1: Gå direkt till första avdelningen
    console.log("🌐 Går direkt till första avdelningen...");
    try {
      await page.goto("https://www.atg.se/spel/2025-09-13/V75/bollnas/avd/1", {
        timeout: 60000,
      });
      await page.waitForLoadState("networkidle", { timeout: 30000 });
      await page.waitForTimeout(5000); // Längre paus så du hinner se
      console.log("✅ Första avdelningen laddad");
    } catch (error) {
      console.log("⚠️ Kunde inte ladda första avdelningen:", error.message);
      return {};
    }

    // Steg 2: Klicka på "Godkänn alla cookies"
    console.log("🍪 Klickar på 'Godkänn alla cookies'...");
    try {
      await page.click('button:has-text("Godkänn alla cookies")', {
        timeout: 10000,
      });
      console.log("✅ Cookies accepterade");
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log("ℹ️ Inga cookies att acceptera eller redan accepterade");
    }

    // Steg 3: Logga in för att få loppkommentarer
    console.log("🔐 Loggar in för att få loppkommentarer...");
    try {
      // Stäng eventuella modaler först
      try {
        // Stäng "Spelpaus" om det finns
        await page.click('[data-test-id="responsible-gaming-header"] button', {
          timeout: 2000,
        });
        console.log("✅ Stängde Spelpaus");
      } catch (e) {
        // Ignorera om ingen Spelpaus
      }

      await page.waitForTimeout(3000);

      // Klicka på "Logga in" med flera olika selektorer
      const loginSelectors = [
        'button:has-text("Logga in")',
        '[data-test-id="login-button"]',
        'a:has-text("Logga in")',
        'button[class*="login"]',
        '[href*="login"]',
      ];

      let loginClicked = false;
      for (const selector of loginSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.click(selector);
          console.log(`✅ Klickade på inloggning med: ${selector}`);
          loginClicked = true;
          break;
        } catch (e) {
          console.log(`⚠️ Kunde inte klicka med: ${selector}`);
        }
      }

      if (!loginClicked) {
        throw new Error("Kunde inte hitta inloggningsknapp");
      }

      await page.waitForTimeout(3000);

      // Vänta på login modal och klicka på "Lösenord"
      try {
        // Vänta på att modalen ska ladda
        await page.waitForSelector("text=Lösenord", {
          timeout: 15000,
        });

        // Klicka på "Lösenord" knappen
        await page.click("text=Lösenord", { timeout: 10000 });
        console.log("✅ Klickade på 'Lösenord'");

        // Vänta på att inloggningsformuläret ska laddas
        await page.waitForTimeout(5000);
      } catch (error) {
        console.log("⚠️ Kunde inte klicka på 'Lösenord':", error.message);
        // Försök med fallback-selektorer
        try {
          // Hitta elementet som innehåller "Lösenord" text
          const losenordElement = await page.locator("text=Lösenord").first();
          await losenordElement.click();
          console.log("✅ Klickade på 'Lösenord' med fallback");
          await page.waitForTimeout(5000);
        } catch (e) {
          console.log("⚠️ Kunde inte klicka på 'Lösenord' med fallback");
          throw error;
        }
      }

      // Fyll i användarnamn
      try {
        // Vänta på att inloggningsformuläret ska laddas helt
        await page.waitForTimeout(3000);

        // Hitta rätt användarnamn-fält (inte cookie-sökfältet)
        const usernameSelectors = [
          'input[name="username"]',
          'input[placeholder*="användarnamn"]',
          'input[placeholder*="email"]',
          'input[type="text"]:not([id*="search"])',
          'input[type="text"]:not([placeholder*="Sök"])',
        ];

        let usernameFilled = false;
        for (const selector of usernameSelectors) {
          try {
            await page.fill(selector, "jesSjo680", { timeout: 5000 });
            console.log(`✅ Fyllde i användarnamn med: ${selector}`);
            usernameFilled = true;
            break;
          } catch (e) {
            console.log(`⚠️ Kunde inte fylla i användarnamn med: ${selector}`);
          }
        }

        if (!usernameFilled) {
          throw new Error("Kunde inte hitta användarnamn-fält");
        }

        await page.waitForTimeout(1000);
      } catch (error) {
        console.log("⚠️ Kunde inte fylla i användarnamn:", error.message);
        throw error;
      }

      // Fyll i lösenord
      try {
        const passwordSelectors = [
          'input[type="password"]',
          'input[name="password"]',
          'input[placeholder*="lösenord"]',
        ];

        let passwordFilled = false;
        for (const selector of passwordSelectors) {
          try {
            await page.fill(selector, "Jeppe1599", { timeout: 5000 });
            console.log(`✅ Fyllde i lösenord med: ${selector}`);
            passwordFilled = true;
            break;
          } catch (e) {
            console.log(`⚠️ Kunde inte fylla i lösenord med: ${selector}`);
          }
        }

        if (!passwordFilled) {
          throw new Error("Kunde inte hitta lösenords-fält");
        }

        await page.waitForTimeout(1000);
      } catch (error) {
        console.log("⚠️ Kunde inte fylla i lösenord:", error.message);
        throw error;
      }

      // Klicka på "Logga in" i formuläret
      try {
        // Försök först med vanlig klick
        await page.click('button:has-text("Logga in"), button[type="submit"]', {
          timeout: 5000,
        });
        console.log("✅ Klickade på 'Logga in' i formuläret");
        await page.waitForTimeout(10000); // Vänta längre på inloggning
      } catch (error) {
        console.log("⚠️ Vanlig klick misslyckades, försöker med JavaScript...");
        // Fallback till JavaScript-klick
        try {
          await page.evaluate(() => {
            // Hitta alla knappar som innehåller "Logga in" text
            const allButtons = document.querySelectorAll("button");
            for (let button of allButtons) {
              if (button.textContent.includes("Logga in")) {
                button.click();
                return true;
              }
            }
            // Hitta submit-knappar
            const submitButtons = document.querySelectorAll(
              'button[type="submit"]'
            );
            if (submitButtons.length > 0) {
              submitButtons[0].click();
              return true;
            }
            return false;
          });
          console.log("✅ JavaScript-klick på 'Logga in' lyckades");
          await page.waitForTimeout(10000); // Vänta längre på inloggning
        } catch (jsError) {
          console.log("⚠️ JavaScript-klick misslyckades:", jsError.message);
          throw error;
        }
      }

      console.log("✅ Inloggning lyckades");
    } catch (error) {
      console.log("⚠️ Inloggning misslyckades:", error.message);
      console.log("ℹ️ Fortsätter utan inloggning...");
    }

    // Steg 4: Klicka på "Utöka alla" (endast en gång)
    console.log("📖 Klickar på 'Utöka alla'...");
    let utokaKlickad = false;

    // Vänta lite extra för att säkerställa att allt är laddat
    console.log("⏳ Väntar på att sidan ska ladda helt...");
    await page.waitForTimeout(8000);

    try {
      await page.click('button:has-text("Utöka alla")', { timeout: 20000 });
      console.log("✅ 'Utöka alla' klickad");
      utokaKlickad = true;
    } catch (error) {
      console.log("⚠️ Försök 1 misslyckades för 'Utöka alla':", error.message);
    }

    if (!utokaKlickad) {
      try {
        const utokaButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.find(
            (button) =>
              button.textContent && button.textContent.includes("Utöka alla")
          );
        });
        if (utokaButton) {
          await page.evaluate((button) => button.click(), utokaButton);
          console.log("✅ 'Utöka alla' (JavaScript) klickad");
          utokaKlickad = true;
        }
      } catch (error) {
        console.log(
          "⚠️ Försök 2 misslyckades för 'Utöka alla':",
          error.message
        );
      }
    }

    if (utokaKlickad) {
      await page.waitForTimeout(15000); // Längre paus så "Utöka alla" hinner ladda all data
      console.log("⏳ Väntar på att all hästhistorik ska laddas...");
    } else {
      console.log("⚠️ Kunde inte hitta 'Utöka alla' - fortsätter ändå");
    }

    // Steg 5: Extrahera datum för senaste 5 starterna per häst
    const horseDates = await extractHorseDatesFromPage(page);
    console.log(
      `📅 Extraherade datum för ${Object.keys(horseDates).length} hästar`
    );

    // Steg 6: Använd API för att hämta detaljerad data för dessa datum
    const horseHistory = await fetchDetailedHistoryFromAPI(horseDates);

    return horseHistory;
  } catch (error) {
    console.log(`💥 Fel vid hybrid approach: ${error.message}`);
    console.log("🔄 Faller tillbaka på tom historik...");
    return {};
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extrahera datum för senaste 5 starterna från webbsidan
 */
async function extractHorseDatesFromPage(page) {
  const horseDates = {};

  try {
    // Gå igenom alla avdelningar (1-7)
    for (let avdelning = 1; avdelning <= 7; avdelning++) {
      console.log(`🏇 Bearbetar avdelning ${avdelning}...`);

      // Navigera till avdelningen (hoppa över avdelning 1 eftersom vi redan är där)
      if (avdelning > 1) {
        const avdelningUrl = `https://www.atg.se/spel/2025-09-13/V75/bollnas/avd/${avdelning}`;
        console.log(`🌐 Går till ${avdelningUrl}`);

        try {
          await page.goto(avdelningUrl, { timeout: 60000 });
          await page.waitForLoadState("networkidle", { timeout: 30000 });
          await page.waitForTimeout(8000); // Längre paus så du hinner se varje avdelning
          console.log(
            `⏳ Väntar på att avdelning ${avdelning} ska ladda helt...`
          );
        } catch (error) {
          console.log(
            `⚠️ Fel vid navigering till avdelning ${avdelning}: ${error.message}`
          );
          continue;
        }
      } else {
        console.log(`ℹ️ Redan på avdelning ${avdelning}, fortsätter...`);
      }

      // Hitta alla hästhistorik-tabeller på sidan
      const historyTables = await page.$$('table:has-text("DATUM")');
      console.log(
        `🔍 Hittade ${historyTables.length} hästhistorik-tabeller för avdelning ${avdelning}`
      );

      for (let i = 0; i < historyTables.length; i++) {
        const table = historyTables[i];

        // Hitta hästnummer genom att gå uppåt i DOM-trädet
        const horseNumber = await findHorseNumberFromTable(table);

        if (horseNumber) {
          console.log(
            `🐎 Bearbetar häst ${horseNumber} i avdelning ${avdelning}`
          );

          // Extrahera datum från tabellen
          const dates = await extractDatesFromTable(table);
          if (dates.length > 0) {
            // Om vi redan har datum för detta hästnummer, lägg till dem
            if (horseDates[horseNumber]) {
              horseDates[horseNumber] = [...horseDates[horseNumber], ...dates];
            } else {
              horseDates[horseNumber] = dates;
            }
            console.log(
              `📅 Hittade ${
                dates.length
              } datum för häst ${horseNumber}: ${dates.join(", ")}`
            );
          }
        } else {
          console.log(
            `⚠️ Kunde inte hitta hästnummer för tabell ${
              i + 1
            } i avdelning ${avdelning}`
          );
        }
      }
    }

    return horseDates;
  } catch (error) {
    console.log(`💥 Fel vid extrahering av hästdatum: ${error.message}`);
    return {};
  }
}

/**
 * Hitta hästnummer genom att gå uppåt i DOM-trädet från tabellen
 */
async function findHorseNumberFromTable(table) {
  try {
    let currentElement = table;

    // Gå uppåt i DOM-trädet för att hitta hästnummer
    for (let i = 0; i < 15; i++) {
      currentElement = await currentElement.evaluateHandle(
        (el) => el.parentElement
      );

      if (currentElement) {
        const text = await currentElement.textContent();

        // Sök efter hästnummer i olika format
        // Format 1: "1. Hästnamn" eller "2. Hästnamn"
        let horseNumberMatch = text.match(/\b(\d+)\s*\.\s*[A-ZÅÄÖ]/);
        if (horseNumberMatch) {
          return parseInt(horseNumberMatch[1]);
        }

        // Format 2: "Nr 1" eller "Start 2"
        horseNumberMatch = text.match(/(?:Nr|Start)\s*(\d+)/i);
        if (horseNumberMatch) {
          return parseInt(horseNumberMatch[1]);
        }

        // Format 3: Bara nummer följt av punkt och hästnamn
        horseNumberMatch = text.match(/^(\d+)\.\s*[A-ZÅÄÖ]/m);
        if (horseNumberMatch) {
          return parseInt(horseNumberMatch[1]);
        }

        // Format 4: Sök efter nummer i början av texten
        horseNumberMatch = text.match(/^(\d+)\s*[A-ZÅÄÖ]/m);
        if (horseNumberMatch) {
          return parseInt(horseNumberMatch[1]);
        }
      }
    }
  } catch (error) {
    console.log(`⚠️ Kunde inte hitta hästnummer: ${error.message}`);
  }

  return null;
}

/**
 * Extrahera datum från en hästhistorik-tabell
 */
async function extractDatesFromTable(table) {
  const dates = [];

  try {
    const rows = await table.$$("tr");

    for (const row of rows) {
      const cells = await row.$$("td");
      if (cells.length > 0) {
        const firstCellText = await cells[0].textContent();

        // Kontrollera om första cellen innehåller ett datum (YYYY-MM-DD format)
        const dateMatch = firstCellText.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          dates.push(dateMatch[1]);
        }
      }
    }
  } catch (error) {
    console.log(
      `⚠️ Fel vid extrahering av datum från tabell: ${error.message}`
    );
  }

  return dates;
}

/**
 * Hämta detaljerad hästhistorik via API för specifika datum
 */
async function fetchDetailedHistoryFromAPI(horseDates) {
  const horseHistory = {};

  try {
    for (const [horseNumber, dates] of Object.entries(horseDates)) {
      console.log(
        `🔍 Hämtar detaljerad historik för häst ${horseNumber} med ${dates.length} datum...`
      );

      const detailedHistory = [];

      for (const date of dates) {
        try {
          // Hämta kalender för detta datum
          const dayData = await fetchDay(date);
          const gameIds = findGameIds(dayData);

          for (const gameId of gameIds) {
            try {
              const gameData = await fetchGame(gameId);
              const races = gameData?.races || [];

              for (const race of races) {
                const starts = race?.starts || [];

                for (const start of starts) {
                  // Hitta rätt häst baserat på hästnummer
                  if (start?.number == horseNumber) {
                    const result = start?.result || {};
                    const driver = start?.driver || {};

                    // Extrahera skor-information
                    const shoes = start?.shoes || {};
                    let shoeStr = "";
                    if (shoes.front && shoes.back) {
                      shoeStr = "CC";
                    } else if (shoes.front) {
                      shoeStr = "C¢";
                    } else if (shoes.back) {
                      shoeStr = "¢C";
                    } else {
                      shoeStr = "¢¢";
                    }

                    // Extrahera vagn-information
                    const sulky = start?.sulky || {};
                    const wagonType = sulky.type || "Vanlig";

                    const startData = {
                      date: gameData?.startTime || race?.startTime || date,
                      track:
                        gameData?.track?.name ||
                        race?.track?.name ||
                        "Okänd bana",
                      raceNumber: race?.number || 0,
                      distance: race?.distance || 0,
                      startMethod: race?.startMethod || "Okänd",
                      position: result?.place || result?.finishOrder || 0,
                      kmTime: result?.kmTime || start?.kmTime || "",
                      odds: start?.odds || start?.finalOdds || "",
                      driver:
                        `${driver?.firstName || ""} ${
                          driver?.lastName || ""
                        }`.trim() ||
                        driver?.name ||
                        "",
                      shoes: shoeStr,
                      wagon: wagonType,
                      comment: result?.comment || "",
                      gameId: gameId,
                    };

                    detailedHistory.push(startData);
                    console.log(
                      `✅ Hittade detaljerad data: ${startData.date} ${startData.track}-${startData.raceNumber} (${startData.position})`
                    );
                  }
                }
              }
            } catch (error) {
              console.log(`⚠️ Fel vid hämtning av ${gameId}: ${error.message}`);
            }
          }
        } catch (error) {
          console.log(`⚠️ Fel vid hämtning av ${date}: ${error.message}`);
        }
      }

      // Sortera efter datum (nyast först)
      detailedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      horseHistory[horseNumber] = detailedHistory.slice(0, 5); // Max 5 senaste starter

      console.log(
        `✅ Komplett historik för häst ${horseNumber}: ${detailedHistory.length} starter`
      );
    }

    return horseHistory;
  } catch (error) {
    console.log(
      `💥 Fel vid API-hämtning av detaljerad historik: ${error.message}`
    );
    return {};
  }
}

/**
 * Hitta alla gameIds i en kalender-data struktur
 */
function findGameIds(data) {
  const gameIds = new Set();

  function walk(obj) {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach(walk);
      } else {
        for (const [key, value] of Object.entries(obj)) {
          if (
            key.toLowerCase().includes("gameid") &&
            typeof value === "string" &&
            value.includes("_")
          ) {
            gameIds.add(value);
          } else {
            walk(value);
          }
        }
      }
    }
  }

  walk(data);
  return Array.from(gameIds);
}

/**
 * Hämta kalender för en dag
 */
async function fetchDay(dateStr) {
  const url = `${BASE}/calendar/day/${dateStr}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

/**
 * Generera hybrid V75 startlista (utan hästhistorik)
 */
async function generateHybridV75StartlistMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const title = `# V75 – utökad startlista ${
    meeting ? meeting + " – " : ""
  }${dateStr}`;
  const races = Array.isArray(game?.races) ? game.races : [];
  let md = `${title}\n\n`;

  // Hämta kompletterande data via web scraping
  const trackName = game?.tracks?.[0]?.name || meeting || "bollnas";
  const raceUrl = `https://www.atg.se/spel/${dateStr}/V75/${trackName.toLowerCase()}`;
  console.log(`🌐 Hämtar kompletterande data från ${raceUrl}...`);

  const additionalData = await scrapeAdditionalData(raceUrl);

  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const raceName = s(r?.name);
    const distance = s(r?.distance);
    const startMethod = s(r?.startMethod);
    const legNumber = i + 1; // V75-1 till V75-7 baserat på position

    md += `## V75-${legNumber} – ${raceName}\n`;
    md += `*${distance ? distance + " m, " : ""}${
      startMethod ? startMethod : ""
    }*\n\n`;

    md +=
      "| Nr | Häst/Kusk | V75% | TREND% | V-ODDS | Tränare | Spår | Rekord | Summa | Skor | Vagn | Tipskommentar |\n";
    md +=
      "|---:|---|---|---:|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|\n";

    const starts = Array.isArray(r?.starts) ? r.starts : [];
    for (const st of starts) {
      const number = s(st?.number);
      const horseName = s(st?.horse?.name);

      // Använd fullständigt kusknamn om tillgängligt
      let driverName = "";
      if (st?.driver?.firstName && st?.driver?.lastName) {
        driverName = `${st.driver.firstName} ${st.driver.lastName}`;
      } else {
        driverName = s(st?.driver?.name || st?.driver?.shortName);
      }

      const horseKusk = `${horseName} / ${driverName}`;

      // Hämta hästdata
      const horse = st?.horse || {};
      const driver = st?.driver || {};
      const trainer = st?.trainer || {};

      // Hämta kompletterande data för denna häst
      const additionalHorseData = additionalData[legNumber]?.[number] || {};

      // Formatera tränarnamn (försök först från web scraping, sedan API)
      const trainerName =
        additionalHorseData.trainer ||
        trainer?.shortName ||
        trainer?.name ||
        "";

      // Formatera rekord
      const record = formatRecord(
        horse?.records?.length ? horse.records[0] : horse?.record
      );

      // Formatera skor (försök först från web scraping, sedan API)
      const shoes = additionalHorseData.shoes || formatShoes(st?.shoes);

      // Formatera vagn (försök först från web scraping, sedan API)
      const wagon = additionalHorseData.wagon || formatWagon(st?.sulky);

      // Hämta startspår
      const postPosition = st?.postPosition || st?.post || "";

      // Hämta intjänat
      const earnings = horse?.money || 0;

      // V75% - formatera korrekt
      const v75Percent = st?.pools?.V75?.betDistribution
        ? (st.pools.V75.betDistribution / 100).toFixed(1)
        : "";

      // TREND% - använd trend från V75 pool
      const trendPercent = st?.pools?.V75?.trend
        ? (st.pools.V75.trend * 100).toFixed(1)
        : "";

      // V-ODDS - formatera som 2,29 eller 99,99
      let vinnareOdds = "";
      if (st?.pools?.vinnare?.odds) {
        const odds = st.pools.vinnare.odds / 100;
        if (odds >= 100) {
          vinnareOdds = "99,99";
        } else {
          vinnareOdds = odds.toFixed(2).replace(".", ",");
        }
      }

      // TIPSKOMMENTAR - från web scraping
      const tipskommentar = additionalHorseData.comment || "";

      md += `| ${number} | ${horseKusk} | ${v75Percent}% | ${trendPercent} | ${vinnareOdds} | ${trainerName} | ${postPosition} | ${record} | ${earnings} | ${shoes} | ${wagon} | ${tipskommentar} |\n`;
    }

    md += "\n";
  }

  return md;
}

/**
 * Generera historisk data (senaste 5 starterna per häst) via API
 */
async function generateHistoricalDataMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const title = `# V75 – historisk data ${
    meeting ? meeting + " – " : ""
  }${dateStr}`;
  const races = Array.isArray(game?.races) ? game.races : [];
  let md = `${title}\n\n`;

  // Hämta hästhistorik via web scraping
  const trackName = game?.tracks?.[0]?.name || meeting || "bollnas";
  const raceUrl = `https://www.atg.se/spel/${dateStr}/V75/${trackName.toLowerCase()}`;
  console.log(`🌐 Hämtar hästhistorik från ${raceUrl}...`);

  const horseHistory = await scrapeHorseHistory(raceUrl);
  console.log("✅ Hästhistorik hämtad via web scraping");

  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const raceName = s(r?.name);
    const legNumber = i + 1; // V75-1 till V75-7 baserat på position

    md += `## V75-${legNumber} – ${raceName}\n\n`;

    // Lägg till hästhistorik om tillgänglig
    const starts = Array.isArray(r?.starts) ? r.starts : [];
    for (const st of starts) {
      const horseName = s(st?.horse?.name);
      const startNumber = st?.number;

      md += `### ${horseName} - Senaste 5 starterna\n\n`;

      // Hämta hästhistorik för denna häst från rätt avdelning
      const divisionHistory = horseHistory[legNumber] || {};
      const horseHistoryData = divisionHistory[startNumber] || [];

      if (horseHistoryData.length > 0) {
        md +=
          "| DATUM | BANA | KUSK | PLAC. | DISTANS : SPÅR | KM-TID | SKOR | ODDS | PRIS | VAGN | ANM | VIDEO | LOPPKOMMENTAR |\n";
        md +=
          "|-------|------|------|-------|----------------|--------|------|------|------|------|-----|-------|---------------|\n";

        // Visa max 5 senaste starter
        const recentStarts = horseHistoryData.slice(0, 5);
        for (const start of recentStarts) {
          md += `| ${start.date || ""} | ${start.track || ""} | ${
            start.driver || ""
          } | ${start.position || ""} | ${start.distance || ""} | ${
            start.kmTime || ""
          } | ${start.shoes || ""} | ${start.odds || ""} | ${
            start.price || ""
          } | ${start.wagon || ""} | ${start.anm || ""} | ${
            start.video || ""
          } | ${start.comment || ""} |\n`;
        }
      } else {
        md += "*Hästhistorik kunde inte extraheras via web scraping.*\n";
      }

      md += "\n";
    }
  }

  return md;
}

/**
 * Utility: skyddad sträng
 */
function s(x, fallback = "") {
  if (x === null || x === undefined) return fallback;
  return String(x);
}

/**
 * Formatera rekord (tider)
 */
function formatRecord(record) {
  if (!record) return "";
  const t = record.time;
  if (!t) return "";
  // Ex: {minutes:1, seconds:14, tenths:1} -> "1.14,1"
  return `${t.minutes}.${String(t.seconds).padStart(2, "0")},${t.tenths}`;
}

/**
 * Formatera skor
 */
function formatShoes(shoes) {
  if (!shoes) return "";
  const f = shoes.front?.hasShoe;
  const b = shoes.back?.hasShoe;

  if (f && b) return "skor runt om";
  if (!f && !b) return "barfota runt om";
  if (!f && b) return "barfota fram";
  if (f && !b) return "barfota bak";
  return "";
}

/**
 * Formatera vagn
 */
function formatWagon(sulky) {
  if (!sulky) return "";
  return sulky.type?.text || "";
}

module.exports = {
  scrapeHorseHistory,
  scrapeAdditionalData,
  generateHybridV75StartlistMarkdown,
  generateHistoricalDataMarkdown,
};
