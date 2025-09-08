#!/usr/bin/env node
// scripts/generateV75.js
// Användning:
//   node scripts/generateV75.js result 2025-09-06
//   node scripts/generateV75.js startlist 2025-09-13

const fs = require("fs");
const path = require("path");
const {
  fetchV75GameId,
  fetchV75Game,
  generateV75ResultMarkdown,
  generateV75StartlistMarkdown,
} = require("../lib/atg");
const {
  generateHybridV75StartlistMarkdown,
  generateHistoricalDataMarkdown,
} = require("../lib/hybrid-atg");

async function main() {
  const [mode, dateStr] = process.argv.slice(2);
  if (!mode || !dateStr) {
    console.error(
      "Usage: node scripts/generateV75.js <result|startlist> <YYYY-MM-DD>"
    );
    process.exit(1);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.error("Date must be YYYY-MM-DD");
    process.exit(1);
  }

  console.log(`→ Hämtar V75 gameId för ${dateStr} ...`);
  const gameId = await fetchV75GameId(dateStr);
  if (!gameId) {
    console.error(`Ingen V75-omgång funnen för ${dateStr}.`);
    process.exit(2);
  }
  console.log(`✔ Hittade gameId: ${gameId}`);

  console.log("→ Hämtar spel/omgångens data ...");
  const game = await fetchV75Game(gameId);

  const outDir = path.resolve(process.cwd(), "out");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  if (mode === "result") {
    const md = generateV75ResultMarkdown(game, dateStr);
    const outPath = path.join(outDir, `v75_result_${dateStr}.md`);
    fs.writeFileSync(outPath, md, "utf8");
    console.log(`✔ Skrev ${outPath}`);
  } else if (mode === "startlist") {
    // Skapa startlista (utan hästhistorik)
    const startlistMd = await generateHybridV75StartlistMarkdown(game, dateStr);
    const startlistPath = path.join(outDir, `v75_startlista_${dateStr}.md`);
    fs.writeFileSync(startlistPath, startlistMd, "utf8");
    console.log(`✔ Skrev ${startlistPath}`);

    // Skapa historisk data (senaste 5 starterna)
    const historicalMd = await generateHistoricalDataMarkdown(game, dateStr);
    const historicalPath = path.join(
      outDir,
      `v75_historisk_data_${dateStr}.md`
    );
    fs.writeFileSync(historicalPath, historicalMd, "utf8");
    console.log(`✔ Skrev ${historicalPath}`);
  } else if (mode === "startlist-api") {
    const md = await generateV75StartlistMarkdown(game, dateStr);
    const outPath = path.join(outDir, `v75_startlista_api_${dateStr}.md`);
    fs.writeFileSync(outPath, md, "utf8");
    console.log(`✔ Skrev ${outPath}`);
  } else {
    console.error(
      "Mode måste vara 'result', 'startlist' eller 'startlist-api'."
    );
    process.exit(3);
  }
}

main().catch((err) => {
  console.error("Fel:", err.message || err);
  process.exit(10);
});
