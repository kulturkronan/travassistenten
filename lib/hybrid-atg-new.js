const { chromium } = require("playwright");
const {
  fetchV75GameId,
  fetchV75Game,
  generateV75ResultMarkdown,
  generateV75StartlistMarkdown,
} = require("./atg");

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/**
 * Hämta komplett hästdata via web scraping
 */
async function scrapeHorseHistory(raceUrl) {
  let browser;
  try {
    console.log("🌐 Startar web scraping för hästhistorik...");

    browser = await chromium.launch({
      headless: true,
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

    // Hantera cookie-medgivande
    console.log("🍪 Hanterar cookie-medgivande...");
    try {
      await page.goto(raceUrl, { timeout: 60000 });
      await page.waitForTimeout(3000);

      // Klicka på cookie-medgivande om det finns
      try {
        await page.click('button:has-text("Acceptera")', { timeout: 5000 });
        console.log("✅ Cookie-medgivande accepterat");
      } catch (error) {
        console.log("ℹ️ Inga cookies att acceptera");
      }
    } catch (error) {
      console.log("⚠️ Kunde inte ladda sidan:", error.message);
      return {};
    }

    // Logga in
    console.log("🔐 Loggar in...");
    try {
      await page.click("text=Logga in", { timeout: 10000 });
      await page.waitForSelector('[data-test-id="login-modal"]', {
        timeout: 10000,
      });

      // Klicka på "Lösenord" i inloggningsmodalen
      await page.click("text=Lösenord", { timeout: 5000 });

      // Fyll i inloggningsuppgifter
      await page.fill('input[name="username"]', "jesSjo680");
      await page.fill('input[name="password"]', "Jeppe1599");

      // Klicka på inloggningsknappen
      await page.click('button:has-text("Logga in")', { timeout: 5000 });

      // Vänta på att inloggningen slutförs
      await page.waitForSelector('[data-test-id="user-menu"]', {
        timeout: 15000,
      });
      console.log("✅ Inloggning lyckades");
    } catch (error) {
      console.log("⚠️ Inloggning misslyckades:", error.message);
      return {};
    }

    // Gå direkt till första avdelningen
    console.log("🏇 Går direkt till första avdelningen...");
    const avdelningUrl = `${raceUrl}/avd/1`;
    console.log(`🌐 Avdelning URL: ${avdelningUrl}`);

    try {
      await page.goto(avdelningUrl, { timeout: 60000 });
      await page.waitForTimeout(5000);
      console.log("✅ Första avdelningen laddad!");
    } catch (error) {
      console.log("⚠️ Kunde inte ladda första avdelningen:", error.message);
      return {};
    }

    // Vänta på att sidan laddas helt
    console.log("⏳ Väntar på att sidan laddas...");
    await page.waitForLoadState("networkidle", { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Klicka på "Utöka alla" för att visa hästhistorik
    console.log("📖 Klickar på 'Utöka alla' för att visa hästhistorik...");
    let utokaKlickad = false;

    // Försök 1: Standard "Utöka alla" knapp
    try {
      await page.click('button:has-text("Utöka alla")', { timeout: 10000 });
      console.log("✅ 'Utöka alla' klickad!");
      utokaKlickad = true;
    } catch (error) {
      console.log("⚠️ Försök 1 misslyckades:", error.message);
    }

    // Försök 2: Sök efter knapp som innehåller "Utöka alla" med JavaScript
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
          await utokaButton.click();
          console.log("✅ 'Utöka alla' (JavaScript) klickad!");
          utokaKlickad = true;
        }
      } catch (error) {
        console.log("⚠️ Försök 2 misslyckades:", error.message);
      }
    }

    if (utokaKlickad) {
      console.log(
        "⏳ Väntar 15 sekunder för att låta hästhistorik ladda in..."
      );
      await page.waitForTimeout(15000);
      console.log("📜 Scrollar för att se till att allt laddas...");
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(5000);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(3000);
    } else {
      console.log("⚠️ Kunde inte hitta 'Utöka alla' knapp");
    }

    console.log("🐎 Extraherar hästhistorik...");
    const horseHistory = await extractHorseHistory(page);
    return horseHistory;
  } catch (error) {
    console.log(`💥 Fel vid web scraping: ${error.message}`);
    console.log("🔄 Faller tillbaka på API-data endast...");
    return {};
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extrahera hästhistorik från sidan baserat på startnummer
 */
async function extractHorseHistory(page) {
  const horseHistory = {};

  try {
    // Sök efter alla hästar på sidan (startnummer 1-15)
    for (let startNumber = 1; startNumber <= 15; startNumber++) {
      try {
        console.log(`🔍 Söker efter häst ${startNumber}...`);

        // Hitta hästens sektion baserat på startnummer
        const horseSection =
          (await page.$(`[data-test-id="horse-${startNumber}"]`)) ||
          (await page.$(`[data-horse-number="${startNumber}"]`)) ||
          (await page.$(`.horse-${startNumber}`));

        if (!horseSection) {
          // Försök hitta hästsektionen genom att söka efter startnummer i text
          const horseElements = await page.$$(`*:has-text("${startNumber}")`);
          for (const element of horseElements) {
            const text = await element.textContent();
            if (text.includes(`${startNumber} `) && text.includes("Kusk")) {
              console.log(`✅ Hittade häst ${startNumber} sektion`);

              // Hitta nästa tabell efter denna häst
              const nextTable = await element.evaluateHandle((el) => {
                let current = el;
                while (current && current.nextElementSibling) {
                  current = current.nextElementSibling;
                  if (
                    current.tagName === "TABLE" &&
                    current.textContent.includes("DATUM")
                  ) {
                    return current;
                  }
                }
                return null;
              });

              if (nextTable) {
                const historyData = await extractHistoryFromTable(nextTable);
                if (historyData.length > 0) {
                  horseHistory[startNumber] = historyData;
                  console.log(
                    `✅ Hittade ${historyData.length} starter för häst ${startNumber}`
                  );
                }
              }
              break;
            }
          }
        }
      } catch (error) {
        console.log(
          `⚠️ Fel vid extrahering för häst ${startNumber}: ${error.message}`
        );
      }
    }

    console.log(
      `✅ Extraherade historik för ${Object.keys(horseHistory).length} hästar`
    );
    return horseHistory;
  } catch (error) {
    console.log(`💥 Fel vid extrahering av hästhistorik: ${error.message}`);
    return {};
  }
}

/**
 * Extrahera historik från en specifik tabell
 */
async function extractHistoryFromTable(table) {
  const historyData = [];

  try {
    const rows = await table.$$("tr");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowText = await row.textContent();

      // Hoppa över header-rader
      if (
        rowText.includes("DATUM") ||
        rowText.includes("BANA") ||
        rowText.includes("KUSK") ||
        rowText.includes("PLAC") ||
        rowText.includes("DISTANS") ||
        rowText.includes("SPÅR") ||
        rowText.includes("KM-TID") ||
        rowText.includes("SKOR") ||
        rowText.includes("ODDS") ||
        rowText.includes("PRIS") ||
        rowText.includes("VAGN") ||
        rowText.includes("ANM") ||
        rowText.includes("VIDEO") ||
        rowText.includes("LOPPKOMMENTAR")
      ) {
        continue;
      }

      // Extrahera data från raden
      const cells = await row.$$("td");
      if (cells.length >= 5) {
        try {
          const data = await extractRowData(cells);
          historyData.push(data);
        } catch (error) {
          console.log(
            `⚠️ Kunde inte extrahera data från rad ${i}: ${error.message}`
          );
        }
      }
    }
  } catch (error) {
    console.log(`💥 Fel vid extrahering från tabell: ${error.message}`);
  }

  return historyData;
}

/**
 * Extrahera data från en tabellrad
 */
async function extractRowData(cells) {
  const data = {};

  try {
    // Extrahera datum
    const dateText = await cells[0]?.textContent();
    if (dateText && dateText.includes("2025")) {
      data.date = dateText.trim();
    }

    // Extrahera bana och spår
    const trackText = await cells[1]?.textContent();
    if (trackText) {
      data.track = trackText.trim();
    }

    // Extrahera kusk
    const driverText = await cells[2]?.textContent();
    if (driverText) {
      data.driver = driverText.trim();
    }

    // Extrahera placering
    const placeText = await cells[3]?.textContent();
    if (placeText) {
      data.place = placeText.trim();
    }

    // Extrahera distans och spår
    const distanceText = await cells[4]?.textContent();
    if (distanceText) {
      data.distance = distanceText.trim();
    }

    // Extrahera km-tid
    const timeText = await cells[5]?.textContent();
    if (timeText) {
      data.kmTime = timeText.trim();
    }

    // Extrahera skor
    const shoesText = await cells[6]?.textContent();
    if (shoesText) {
      data.shoes = shoesText.trim();
    }

    // Extrahera odds
    const oddsText = await cells[7]?.textContent();
    if (oddsText) {
      data.odds = oddsText.trim();
    }

    // Extrahera pris
    const priceText = await cells[8]?.textContent();
    if (priceText) {
      data.price = priceText.trim();
    }

    // Extrahera vagn
    const wagonText = await cells[9]?.textContent();
    if (wagonText) {
      data.wagon = wagonText.trim();
    }

    // Extrahera anmärkning
    const commentText = await cells[10]?.textContent();
    if (commentText) {
      data.comment = commentText.trim();
    }
  } catch (error) {
    console.log(`⚠️ Fel vid extrahering av raddata: ${error.message}`);
  }

  return data;
}

/**
 * Generera hybrid V75 startlista med web scraping
 */
async function generateHybridV75StartlistMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const title = `# V75 – utökad startlista ${
    meeting ? meeting + " – " : ""
  }${dateStr}`;
  const races = Array.isArray(game?.races) ? game.races : [];
  let md = `${title}\n\n`;

  // Hämta web scraping-data för första avdelningen
  // Använd rätt track namn från API:et
  console.log(`🔍 Debug - game.tracks:`, game?.tracks);
  console.log(`🔍 Debug - meeting:`, meeting);
  const trackName = game?.tracks?.[0]?.name || meeting || "bollnas";
  console.log(`🔍 Debug - trackName:`, trackName);
  const raceUrl = `https://www.atg.se/spel/${dateStr}/V75/${trackName.toLowerCase()}`;
  console.log(`🌐 Web scraping URL: ${raceUrl}`);
  const horseHistory = await scrapeHorseHistory(raceUrl);

  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const raceName = s(r?.name);
    const distance = s(r?.distance);
    const startMethod = s(r?.startMethod);
    const leg = s(r?.legNumber || r?.number || "");

    md += `## ${leg ? `V75-${leg}` : "Avdelning"} – ${raceName}\n`;
    md += `*${distance ? distance + " m, " : ""}${
      startMethod ? startMethod : ""
    }*\n\n`;

    md +=
      "| Nr | Häst | Kusk | Tränare | Spår | Hcp | Form | Rekord | Vinstsumma | V75% | V | P | SKOR | VAGN | ANM |\n";
    md += "|---:|---|---|---|---:|---:|---|---|---:|---:|---:|---|---|---|\n";

    const starts = Array.isArray(r?.starts) ? r.starts : [];
    for (const st of starts) {
      const number = s(st?.number);
      const horseName = s(st?.horse?.name);
      const driver = s(st?.driver?.name || st?.driver?.shortName);
      const trainer = s(st?.trainer?.name);
      const post = s(st?.postPosition ?? st?.startNumber ?? st?.number);
      const handicap = s(st?.handicap ?? "");
      const form = s(st?.horse?.form ?? "");

      // Hantera [object Object] för record, shoes, wagon
      let record = s(st?.horse?.record ?? "");
      if (record === "[object Object]") {
        record = s(
          st?.horse?.record?.time ??
            st?.horse?.record?.kmTime ??
            st?.horse?.record?.distance ??
            ""
        );
      }

      let shoes = s(st?.horse?.shoes ?? "");
      if (shoes === "[object Object]") {
        shoes = s(st?.horse?.shoes?.front ?? st?.horse?.shoes?.rear ?? "");
      }

      let wagon = s(st?.horse?.sulky ?? "");
      if (wagon === "[object Object]") {
        wagon = s(st?.horse?.sulky?.type ?? "");
      }

      const money = s(st?.horse?.money ?? st?.horse?.earnings ?? "");
      const v75Percent = st?.pools?.V75?.betDistribution
        ? (st.pools.V75.betDistribution / 100).toFixed(1) + "%"
        : "";
      const vinnareOdds = st?.pools?.vinnare?.odds
        ? st.pools.vinnare.odds.toFixed(2)
        : "";
      const platsOdds = st?.pools?.plats?.minOdds
        ? st.pools.plats.minOdds.toFixed(2)
        : "";

      md += `| ${number} | ${horseName} | ${driver} | ${trainer} | ${post} | ${handicap} | ${form} | ${record} | ${money} | ${v75Percent} | ${vinnareOdds} | ${platsOdds} | ${shoes} | ${wagon} |  |\n`;
    }

    md += "\n";

    // Lägg till "Senaste 5 starterna" för varje häst
    for (const st of starts) {
      const horseName = s(st?.horse?.name);
      const startNumber = st?.number;

      md += `### ${horseName} - Senaste 5 starterna\n\n`;

      if (horseHistory[startNumber] && horseHistory[startNumber].length > 0) {
        md +=
          "| DATUM | BANA | KUSK | PLAC. | DISTANS : SPÅR | KM-TID | SKOR | ODDS | PRIS | VAGN | ANM | VIDEO | LOPPKOMMENTAR |\n";
        md +=
          "|-------|------|------|-------|----------------|--------|------|------|------|------|-----|-------|---------------|\n";

        // Visa max 5 senaste starter
        const recentStarts = horseHistory[startNumber].slice(0, 5);
        for (const start of recentStarts) {
          md += `| ${start.date || ""} | ${start.track || ""} | ${
            start.driver || ""
          } | ${start.place || ""} | ${start.distance || ""} | ${
            start.kmTime || ""
          } | ${start.shoes || ""} | ${start.odds || ""} | ${
            start.price || ""
          } | ${start.wagon || ""} |  |  | ${start.comment || ""} |\n`;
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

module.exports = {
  scrapeHorseHistory,
  generateHybridV75StartlistMarkdown,
};
