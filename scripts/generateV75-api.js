// scripts/generateV75-api.js
// API-baserad V75-generator med inloggning

const fs = require("fs");
const path = require("path");
const {
  fetchV75Game,
  getV75HorseHistory,
  generateCompleteV75StartlistMarkdown,
  generateHistoricalDataMarkdown,
} = require("../lib/api-atg");

/**
 * Hitta V75 gameId för ett specifikt datum
 */
async function findV75GameId(dateStr) {
  const BASE = "https://www.atg.se/services/racinginfo/v1/api";

  try {
    const url = `${BASE}/calendar/day/${dateStr}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Sök efter V75 i kalendern
    const v75Games = [];

    function findV75Games(obj) {
      if (obj && typeof obj === "object") {
        if (Array.isArray(obj)) {
          obj.forEach(findV75Games);
        } else {
          for (const [key, value] of Object.entries(obj)) {
            if (key === "games" && Array.isArray(value)) {
              for (const game of value) {
                if (game.name && game.name.includes("V75")) {
                  v75Games.push({
                    id: game.id,
                    name: game.name,
                    date: game.date,
                  });
                }
              }
            } else {
              findV75Games(value);
            }
          }
        }
      }
    }

    findV75Games(data);

    if (v75Games.length > 0) {
      // Välj den första V75-omgången för detta datum
      return v75Games[0].id;
    }

    throw new Error(`Ingen V75-omgång hittades för ${dateStr}`);
  } catch (error) {
    console.log(`💥 Fel vid sökning efter V75 gameId: ${error.message}`);
    throw error;
  }
}

/**
 * Huvudfunktion
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const dateStr = args[1] || new Date().toISOString().split("T")[0];

  console.log(`🚀 Startar V75 API-generator för ${dateStr}...`);

  try {
    // Hitta V75 gameId
    console.log(`→ Hämtar V75 gameId för ${dateStr} ...`);
    const gameId = await findV75GameId(dateStr);
    console.log(`✔ Hittade gameId: ${gameId}`);

    // Hämta V75 data
    console.log(`→ Hämtar spel/omgångens data ...`);
    const game = await fetchV75Game(gameId);
    console.log(`✔ Hämtade data för ${game.races?.length || 0} avdelningar`);

    if (command === "startlist") {
      // Generera startlista
      console.log(`→ Genererar utökad startlista...`);
      const startlistMarkdown = await generateCompleteV75StartlistMarkdown(
        game,
        dateStr
      );

      // Skriv till fil
      const outputDir = path.join(__dirname, "..", "out");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const startlistFile = path.join(
        outputDir,
        `v75_startlista_${dateStr}.md`
      );
      fs.writeFileSync(startlistFile, startlistMarkdown, "utf8");
      console.log(`✔ Skrev ${startlistFile}`);
    } else if (command === "history") {
      // Generera hästhistorik
      console.log(`→ Hämtar hästhistorik...`);
      const horseHistory = await getV75HorseHistory(gameId);

      console.log(`→ Genererar historisk data...`);
      const historyMarkdown = await generateHistoricalDataMarkdown(
        game,
        dateStr,
        horseHistory
      );

      // Skriv till fil
      const outputDir = path.join(__dirname, "..", "out");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const historyFile = path.join(
        outputDir,
        `v75_historisk_data_${dateStr}.md`
      );
      fs.writeFileSync(historyFile, historyMarkdown, "utf8");
      console.log(`✔ Skrev ${historyFile}`);
    } else if (command === "both") {
      // Generera både startlista och historik
      console.log(`→ Genererar utökad startlista...`);
      const startlistMarkdown = await generateCompleteV75StartlistMarkdown(
        game,
        dateStr
      );

      console.log(`→ Hämtar hästhistorik...`);
      const horseHistory = await getV75HorseHistory(gameId);

      console.log(`→ Genererar historisk data...`);
      const historyMarkdown = await generateHistoricalDataMarkdown(
        game,
        dateStr,
        horseHistory
      );

      // Skriv till filer
      const outputDir = path.join(__dirname, "..", "out");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const startlistFile = path.join(
        outputDir,
        `v75_startlista_${dateStr}.md`
      );
      const historyFile = path.join(
        outputDir,
        `v75_historisk_data_${dateStr}.md`
      );

      fs.writeFileSync(startlistFile, startlistMarkdown, "utf8");
      fs.writeFileSync(historyFile, historyMarkdown, "utf8");

      console.log(`✔ Skrev ${startlistFile}`);
      console.log(`✔ Skrev ${historyFile}`);
    } else {
      console.log(`❌ Okänt kommando: ${command}`);
      console.log(
        `Användning: node scripts/generateV75-api.js <startlist|history|both> [YYYY-MM-DD]`
      );
      process.exit(1);
    }

    console.log(`✅ Klar!`);
  } catch (error) {
    console.log(`💥 Fel: ${error.message}`);
    process.exit(1);
  }
}

// Kör om detta är huvudfilen
if (require.main === module) {
  main();
}

module.exports = { main };

