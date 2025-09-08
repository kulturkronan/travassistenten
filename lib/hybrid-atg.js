const { chromium } = require("playwright");
const {
  fetchV75GameId,
  fetchV75Game,
  generateV75ResultMarkdown,
  generateV75StartlistMarkdown,
} = require("./atg");
const { getHorseHistory, fetchGame } = require("./atg-history");

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

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

    // Steg 3: Klicka på "Utöka alla" (endast en gång)
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
 * Generera hybrid V75 startlista med API-baserad hästhistorik
 */
async function generateHybridV75StartlistMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const title = `# V75 – utökad startlista ${
    meeting ? meeting + " – " : ""
  }${dateStr}`;
  const races = Array.isArray(game?.races) ? game.races : [];
  let md = `${title}\n\n`;

  // Hämta hästhistorik via hybrid approach
  const trackName = game?.tracks?.[0]?.name || meeting || "bollnas";
  const raceUrl = `https://www.atg.se/spel/${dateStr}/V75/${trackName.toLowerCase()}`;
  console.log(`🌐 Hybrid approach URL: ${raceUrl}`);

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

      // Hantera [object Object] för rekord
      let record = st?.horse?.record || "";
      if (typeof record === "object" && record !== null) {
        record = record.time || record.kmTime || record.distance || "";
      }

      // Hantera [object Object] för skor
      let shoes = st?.horse?.shoes || "";
      if (typeof shoes === "object" && shoes !== null) {
        shoes = shoes.front || shoes.back || "";
      }

      // Hantera [object Object] för vagn
      let wagon = st?.horse?.sulky || "";
      if (typeof wagon === "object" && wagon !== null) {
        wagon = wagon.type || "";
      }

      const money = s(st?.horse?.money ?? st?.horse?.earnings ?? "");
      const v75Percent = st?.pools?.V75?.betDistribution
        ? (st.pools.V75.betDistribution / 100).toFixed(1)
        : "";
      const vinnareOdds = st?.pools?.vinnare?.odds || "";
      const platsOdds = st?.pools?.plats?.minOdds || "";

      md += `| ${number} | ${horseName} | ${driver} | ${trainer} | ${post} | ${handicap} | ${form} | ${record} | ${money} | ${v75Percent}% | ${vinnareOdds} | ${platsOdds} | ${shoes} | ${wagon} | |\n`;
    }

    md += "\n";

    // Lägg till hästhistorik om tillgänglig
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
          } | ${start.position || ""} | ${start.distance || ""} | ${
            start.kmTime || ""
          } | ${start.shoes || ""} | ${start.odds || ""} | ${
            start.prize || ""
          } | ${start.wagon || ""} |  |  | ${start.comment || ""} |\n`;
        }
      } else {
        md += "*Hästhistorik kunde inte extraheras via hybrid approach.*\n";
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
