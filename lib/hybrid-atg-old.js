// lib/hybrid-atg.js
// Hybrid-lösning som kombinerar API-data med web scraping för komplett hästdata

const { chromium } = require("playwright");
const config = require("../config");
const { fetchV75GameId, fetchV75Game, fetchRaceTips } = require("./atg");

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/**
 * Hämta komplett hästdata via web scraping
 */
async function scrapeHorseHistory(raceUrl) {
  let browser;
  try {
    console.log("🌐 Startar web scraping för hästhistorik...");

    browser = await chromium.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Gå till ATG:s startsida
    console.log("🏇 Går till ATG:s startsida...");
    await page.goto("https://www.atg.se", { timeout: 60000 });
    await page.waitForTimeout(3000);

    // Hantera cookie-popup
    console.log("🍪 Hanterar cookie-popup...");
    try {
      await page.click("text=Godkänn alla cookies");
      await page.waitForTimeout(2000);
      console.log("✅ Cookies accepterade!");
    } catch (error) {
      console.log("⚠️ Kunde inte hitta cookie-knapp:", error.message);
    }

    // Förbättrad inloggning
    console.log("🔐 Loggar in...");
    try {
      // Klicka på "Logga in"
      await page.click("text=Logga in", { timeout: 10000 });
      await page.waitForTimeout(3000);

      // Vänta på att inloggningsmodalen laddas
      await page.waitForSelector('input[name="userName"], input[type="text"]', {
        timeout: 15000,
      });

      // Klicka på "Lösenord"
      await page.click("text=Lösenord", { timeout: 10000 });
      await page.waitForTimeout(2000);

      // Vänta på att formuläret laddas
      await page.waitForSelector('input[name="userName"]', { timeout: 10000 });

      // Fyll i användarnamn
      console.log("📝 Fyller i användarnamn...");
      await page.fill('input[name="userName"]', config.atg.username);
      await page.waitForTimeout(1000);

      // Fyll i lösenord
      console.log("🔑 Fyller i lösenord...");
      await page.fill('input[name="password"]', config.atg.password);
      await page.waitForTimeout(1000);

      // Klicka på inloggningsknapp
      console.log("🚀 Klickar på inloggningsknapp...");
      await page.click('button:has-text("Logga in")', { timeout: 10000 });
      await page.waitForTimeout(5000);

      // Kontrollera om inloggningen lyckades
      try {
        await page.waitForSelector(
          "text=Logga ut, text=Min profil, text=Saldo",
          { timeout: 10000 }
        );
        console.log("✅ Inloggning genomförd!");
      } catch (e) {
        console.log("⚠️ Inloggning verkar inte ha lyckats, fortsätter ändå...");
      }
    } catch (error) {
      console.log("⚠️ Kunde inte logga in:", error.message);
      console.log("🔄 Fortsätter utan inloggning...");
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
      return null;
    }

    // Vänta på att sidan laddas helt
    console.log("⏳ Väntar på att sidan laddas...");
    await page.waitForLoadState("networkidle", { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Klicka på "Utöka alla" för att visa hästhistorik
    console.log("📖 Klickar på 'Utöka alla' för att visa hästhistorik...");
    let utokaKlickad = false;

    // Försök 1: Sök efter "Utöka alla" på samma rad som avdelning 1
    try {
      // Sök efter knapp som innehåller "Utöka alla" och är nära avdelning 1
      await page.click('button:has-text("Utöka alla")', { timeout: 10000 });
      console.log("✅ 'Utöka alla' klickad!");
      utokaKlickad = true;
    } catch (error) {
      console.log("⚠️ Försök 1 misslyckades:", error.message);
    }

    // Försök 2: Sök efter knapp som innehåller "Utöka alla" med JavaScript
    if (!utokaKlickad) {
      try {
        // Sök efter knapp som innehåller "Utöka alla" med JavaScript
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

    // Försök 3: Sök efter knapp som innehåller "Utöka alla" och är i samma område som "Anpassa"
    if (!utokaKlickad) {
      try {
        // Sök efter knapp som innehåller "Utöka alla" och är i samma område som "Anpassa"
        const utokaButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.find((button) => {
            const text = button.textContent || "";
            return (
              text.includes("Utöka alla") || text.includes("Expandera alla")
            );
          });
        });

        if (utokaButton) {
          await utokaButton.click();
          console.log("✅ 'Utöka alla' (nära Anpassa) klickad!");
          utokaKlickad = true;
        }
      } catch (error) {
        console.log("⚠️ Försök 3 misslyckades:", error.message);
      }
    }

    // Försök 4: Alternativa texter
    if (!utokaKlickad) {
      const alternatives = [
        "Expandera alla",
        "Visa alla",
        "Utöka",
        "Expandera",
      ];
      for (const alt of alternatives) {
        try {
          await page.click(`button:has-text("${alt}")`, { timeout: 5000 });
          console.log(`✅ '${alt}' klickad!`);
          utokaKlickad = true;
          break;
        } catch (error) {
          // Fortsätt med nästa alternativ
        }
      }
    }

    if (utokaKlickad) {
      // Vänta längre för att låta all data ladda in
      console.log(
        "⏳ Väntar 15 sekunder för att låta hästhistorik ladda in..."
      );
      await page.waitForTimeout(15000);

      // Scrolla ner för att se till att allt laddas
      console.log("📜 Scrollar för att se till att allt laddas...");
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(5000);

      // Scrolla tillbaka upp
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(3000);
    } else {
      console.log("⚠️ Kunde inte hitta 'Utöka alla' knapp");
    }

    // Extrahera hästhistorik
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
 * Extrahera hästhistorik från sidan
 */
async function extractHorseHistory(page) {
  const horseHistory = {};

  try {
    // Sök efter tabeller med hästhistorik
    const historyTables = await page.$$("table");
    console.log(`📋 Hittade ${historyTables.length} tabeller totalt`);

    for (let i = 0; i < historyTables.length; i++) {
      try {
        const tableText = await historyTables[i].textContent();
        if (
          tableText &&
          (tableText.includes("Senaste") ||
            tableText.includes("starts") ||
            tableText.includes("DISTANS") ||
            tableText.includes("DATUM") ||
            tableText.includes("BANA") ||
            tableText.includes("2025"))
        ) {
          console.log(`📊 Tabell ${i + 1} verkar innehålla hästhistorik`);
          console.log(`   Innehåll: ${tableText.slice(0, 300)}...`);

          // Hitta alla rader i tabellen
          const rows = await historyTables[i].$$("tr");
          console.log(`   Antal rader: ${rows.length}`);

          for (let j = 0; j < rows.length; j++) {
            try {
              const rowText = await rows[j].textContent();
              if (rowText) {
                console.log(`   Rad ${j}: ${rowText.slice(0, 150)}...`);

                // Kontrollera om det är en header-rad (innehåller "DATUM", "BANA", etc.)
                if (rowText.includes("DATUM") && rowText.includes("BANA")) {
                  console.log(`   ⏭️ Skippar header-rad ${j}`);
                  continue;
                }

                // Kontrollera om det är en data-rad (innehåller datum eller distans:spår)
                if (
                  rowText.includes("2025") ||
                  rowText.includes(":") ||
                  rowText.includes("Mantorp") ||
                  rowText.includes("Axevalla") ||
                  rowText.includes("Jägersro") ||
                  rowText.includes("Visby") ||
                  rowText.includes("Åby") ||
                  rowText.includes("Vaggeryd") ||
                  rowText.includes("Halmstad") ||
                  rowText.includes("Kalmar") ||
                  rowText.includes("Färjestad") ||
                  rowText.includes("Örebro") ||
                  rowText.includes("Lindesberg") ||
                  rowText.includes("Jarlsberg") ||
                  rowText.includes("Sörlandet") ||
                  rowText.includes("Biri") ||
                  rowText.includes("Årjäng") ||
                  rowText.includes("Åmål") ||
                  rowText.includes("Karlshamn") ||
                  rowText.includes("Rättvik")
                ) {
                  console.log(`   🎯 Potentiell data-rad ${j}`);

                  // Extrahera hästdata från raden
                  const horseData = await extractHorseDataFromRow(rows[j]);
                  if (horseData) {
                    console.log(
                      `   📊 Extraherade data: ${JSON.stringify(
                        horseData
                      ).slice(0, 100)}...`
                    );

                    // Försök att hitta hästnamnet från kontexten
                    const horseName = await findHorseNameFromContext(
                      rows[j],
                      page,
                      allHorseNames
                    );
                    if (horseName) {
                      horseData.horseName = horseName;
                      if (!horseHistory[horseName]) {
                        horseHistory[horseName] = [];
                      }
                      horseHistory[horseName].push(horseData);
                      console.log(`   ✅ Lade till data för ${horseName}`);
                    } else {
                      console.log(
                        `   ⚠️ Kunde inte hitta hästnamn för rad ${j}`
                      );
                      // Lägg till data med generiskt namn för att inte förlora informationen
                      const genericName = `Häst_${
                        Object.keys(horseHistory).length + 1
                      }`;
                      horseData.horseName = genericName;
                      if (!horseHistory[genericName]) {
                        horseHistory[genericName] = [];
                      }
                      horseHistory[genericName].push(horseData);
                      console.log(
                        `   🔄 Lade till data med generiskt namn: ${genericName}`
                      );
                    }
                  } else {
                    console.log(
                      `   ⚠️ Kunde inte extrahera data från rad ${j}`
                    );
                  }
                }
              }
            } catch (error) {
              console.log(`   ⚠️ Fel vid rad ${j}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Fel vid tabell ${i + 1}: ${error.message}`);
      }
    }

    console.log(
      `✅ Extraherade historik för ${Object.keys(horseHistory).length} hästar`
    );

    // Debug: Visa vilka hästar vi hittade
    for (const [horseName, history] of Object.entries(horseHistory)) {
      console.log(`   ${horseName}: ${history.length} starter`);
    }

    return horseHistory;
  } catch (error) {
    console.log(`⚠️ Fel vid extrahering av hästhistorik: ${error.message}`);
    return {};
  }
}

/**
 * Hitta hästnamn från kontexten (från tidigare hästnamn i samma sektion)
 */
async function findHorseNameFromContext(row, page, allHorseNames = []) {
  try {
    // Sök bakåt efter hästnamn i samma sektion
    let currentElement = row;
    let horseName = "";

    // Gå uppåt i DOM-trädet för att hitta hästnamnet
    for (let i = 0; i < 25; i++) {
      currentElement = await currentElement.evaluateHandle(
        (el) => el.parentElement
      );
      if (!currentElement) break;

      const text = await currentElement.textContent();
      if (text) {
        // Sök efter hästnamn med mer flexibel matching
        const horsePatterns =
          allHorseNames.length > 0
            ? allHorseNames
            : [
                // Fallback hästnamn om inga skickas in
                "Anna K.J.",
                "Petite Sirah",
                "Bella Bellissima",
                "Tactic Lane",
                "Global Fairy Tale",
                "Loaded Vilda",
                "Power of Sand",
                "Rose Apple",
                "One Lady Boko",
                "Lainy K.W.",
                "Hafa Go",
                "Rock the Sock",
                "Elva Rapid",
                "Tui Southwind",
                "Walkyria W.F.",
                "Bubble Marke",
                "Tanjo Lane",
                "Maraschino",
                "Nickel Occagnes",
                "Go Kenneth Go",
                "Alvena Roy",
                "Howitends W.F.",
                "Henessi Joy",
                "San Donato",
                "Light In",
              ];

        // Sök efter exakta matchningar först
        for (const horse of horsePatterns) {
          if (text.includes(horse)) {
            horseName = horse;
            break;
          }
        }

        // Om ingen exakt matchning, sök efter partiella matchningar
        if (!horseName) {
          for (const horse of horsePatterns) {
            const parts = horse.split(" ");
            if (parts.length > 1) {
              const firstPart = parts[0];
              if (text.includes(firstPart) && text.includes(parts[1])) {
                horseName = horse;
                break;
              }
            }
          }
        }

        // Om fortfarande ingen matchning, sök efter första delen av namnet
        if (!horseName) {
          for (const horse of horsePatterns) {
            const parts = horse.split(" ");
            if (parts.length > 0) {
              const firstPart = parts[0];
              if (text.includes(firstPart) && firstPart.length > 3) {
                horseName = horse;
                break;
              }
            }
          }
        }

        if (horseName) break;
      }
    }

    // Om vi fortfarande inte hittat något, sök i hela sidan efter hästnamn
    if (!horseName) {
      try {
        const allText = await page.textContent();
        const horsePatterns =
          allHorseNames.length > 0
            ? allHorseNames
            : [
                "Anna K.J.",
                "Petite Sirah",
                "Bella Bellissima",
                "Tactic Lane",
                "Global Fairy Tale",
                "Loaded Vilda",
                "Power of Sand",
                "Rose Apple",
                "One Lady Boko",
                "Lainy K.W.",
                "Hafa Go",
                "Rock the Sock",
                "Elva Rapid",
                "Tui Southwind",
                "Walkyria W.F.",
                "Bubble Marke",
                "Tanjo Lane",
                "Maraschino",
                "Nickel Occagnes",
                "Go Kenneth Go",
                "Alvena Roy",
                "Howitends W.F.",
                "Henessi Joy",
                "San Donato",
                "Light In",
              ];

        for (const horse of horsePatterns) {
          if (allText.includes(horse)) {
            horseName = horse;
            break;
          }
        }
      } catch (error) {
        // Ignorera fel vid sökning i hela sidan
      }
    }

    return horseName;
  } catch (error) {
    return "";
  }
}

/**
 * Extrahera hästdata från en tabellrad
 */
async function extractHorseDataFromRow(row) {
  try {
    const cells = await row.$$("td");
    if (cells.length < 5) return null; // Minska kravet

    const cellTexts = [];
    for (let i = 0; i < cells.length; i++) {
      const text = await cells[i].textContent();
      cellTexts.push(text?.trim() || "");
    }

    // Extrahera data baserat på position (mer flexibel)
    const horseData = {
      date: cellTexts[0] || "",
      track: cellTexts[1] || "",
      driver: cellTexts[2] || "",
      place: cellTexts[3] || "",
      distance: cellTexts[4] || "",
      kmTime: cellTexts[5] || "",
      shoes: cellTexts[6] || "",
      odds: cellTexts[7] || "",
      prize: cellTexts[8] || "",
      wagon: cellTexts[9] || "",
      notes: cellTexts[10] || "",
      video: cellTexts[11] || "",
      comment: cellTexts[12] || "",
      horseName: "", // Kommer att sättas senare
    };

    // Validera att vi har minst datum och bana
    if (!horseData.date || !horseData.track) {
      return null;
    }

    return horseData;
  } catch (error) {
    return null;
  }
}

/**
 * Generera utökad startlista med web scraping-data
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
    const legNumber = i + 1;

    md += `## V75-${legNumber} – ${raceName}\n`;
    md += `*${distance ? distance + " m, " : ""}${
      startMethod ? startMethod : ""
    }*\n\n`;

    // Huvudtabell
    md +=
      "| Nr | Häst | Kusk | Tränare | Spår | Hcp | Form | Rekord | Vinstsumma | V75% | TREND% | V | P | SKOR | VAGN | TIPS |\n";
    md +=
      "|---:|---|---|---|---:|---:|---|---:|---|---:|---:|---:|---:|---:|---:|---|\n";

    const starts = Array.isArray(r?.starts) ? r.starts : [];

    // Hämta speltips för denna avdelning
    const raceId = r?.id;
    let tipsData = null;
    if (raceId) {
      tipsData = await fetchRaceTips(raceId);
    }

    for (const st of starts) {
      // Hantera rekord som kan vara ett objekt (samma logik som i lib/atg.js)
      let record = "";
      if (st?.horse?.record) {
        if (typeof st.horse.record === "object") {
          const time = st.horse.record.time;
          if (time && typeof time === "object") {
            const minutes = time.minutes || 0;
            const seconds = time.seconds || 0;
            const tenths = time.tenths || 0;
            record = `${minutes}.${seconds
              .toString()
              .padStart(2, "0")},${tenths}`;
          } else {
            record = s(st.horse.record.time || st.horse.record.distance || "");
          }
        } else {
          record = s(st.horse.record);
        }
      }

      // V75 betting percentage
      const v75Distribution = st?.pools?.V75?.betDistribution || 0;
      const v75Percent =
        v75Distribution > 0 ? (v75Distribution / 100).toFixed(1) + "%" : "";

      // Win and place odds
      const winOdds = st?.pools?.vinnare?.odds
        ? (st.pools.vinnare.odds / 100).toFixed(2)
        : "";
      const placeOdds = st?.pools?.plats?.minOdds
        ? (st.pools.plats.minOdds / 100).toFixed(2)
        : "";

      // Formatera vinstsumma med mellanslag
      const earnings = st?.horse?.money ?? st?.horse?.earnings ?? 0;
      const formattedEarnings =
        earnings > 0
          ? earnings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
          : "";

      // TREND% - för närvarande inte tillgängligt i API:et
      const trendPercent = "";

      // SKOR (shoes) - från hästdata
      let shoes = "";
      if (st?.horse?.shoes) {
        const frontShoe = st.horse.shoes.front?.hasShoe ? "C" : "¢";
        const backShoe = st.horse.shoes.back?.hasShoe ? "C" : "¢";
        shoes = `${frontShoe}${backShoe}`;
      }

      // VAGN (wagon) - från hästdata
      let wagon = "";
      if (st?.horse?.sulky?.type?.code) {
        wagon = st.horse.sulky.type.code;
      }

      // Hämta hästkommentar
      let horseTip = "";
      if (tipsData && tipsData.comments) {
        const horseComment = tipsData.comments.find(
          (c) => c.startNumber === st?.number
        );
        if (horseComment) {
          horseTip = horseComment.text;
        }
      }

      md += `| ${s(st?.number)} | ${s(st?.horse?.name)} | ${s(
        st?.driver?.name || st?.driver?.shortName
      )} | ${s(st?.trainer?.name)} | ${s(
        st?.postPosition ?? st?.startNumber ?? st?.number
      )} | ${s(st?.handicap ?? "")} | ${s(
        st?.horse?.form ?? ""
      )} | ${record} | ${formattedEarnings} | ${v75Percent} | ${trendPercent} | ${winOdds} | ${placeOdds} | ${shoes} | ${wagon} | ${s(
        horseTip
      )} |\n`;
    }

    md += "\n";

    // Senaste 5 starterna för varje häst
    for (const st of starts) {
      const horseName = st?.horse?.name;
      if (horseName && horseHistory[horseName]) {
        md += `### ${horseName} - Senaste 5 starterna\n\n`;
        md +=
          "| DATUM | BANA | KUSK | PLAC. | DISTANS : SPÅR | KM-TID | SKOR | ODDS | PRIS | VAGN | ANM | VIDEO | LOPPKOMMENTAR |\n";
        md +=
          "|-------|------|------|-------|----------------|--------|------|------|------|------|-----|-------|---------------|\n";

        const history = horseHistory[horseName].slice(0, 5); // Ta bara de 5 senaste
        for (const record of history) {
          md += `| ${record.date} | ${record.track} | ${record.driver} | ${record.place} | ${record.distance} | ${record.kmTime} | ${record.shoes} | ${record.odds} | ${record.prize} | ${record.wagon} | ${record.notes} | ${record.video} | ${record.comment} |\n`;
        }
        md += "\n";
      } else if (horseName) {
        md += `### ${horseName} - Senaste 5 starterna\n\n`;
        md += "*Hästhistorik kunde inte extraheras via web scraping.*\n\n";
      }
    }

    // Speltips för avdelningen
    md += `### Speltips för V75-${legNumber}\n\n`;
    if (tipsData && tipsData.tips) {
      if (tipsData.tips.spetsanalys) {
        md += `**Spetsanalys:**\n${tipsData.tips.spetsanalys}\n\n`;
      }
      if (tipsData.tips.speltips) {
        md += `**Speltips:**\n${tipsData.tips.speltips}\n\n`;
      }
      if (tipsData.tips.ranking) {
        md += `**Ranking:**\n`;
        const ranking = tipsData.tips.ranking;
        if (ranking.a) md += `- A-lag: ${ranking.a.join(", ")}\n`;
        if (ranking.b) md += `- B-lag: ${ranking.b.join(", ")}\n`;
        if (ranking.c) md += `- C-lag: ${ranking.c.join(", ")}\n`;
        md += "\n";
      }
    } else {
      md += `*Speltips för denna avdelning kommer att publiceras närmare loppstart.*\n\n`;
    }
  }

  return md;
}

// Utility funktion
function s(x, fallback = "") {
  if (x === null || x === undefined) return fallback;
  return String(x);
}

module.exports = {
  scrapeHorseHistory,
  generateHybridV75StartlistMarkdown,
};
