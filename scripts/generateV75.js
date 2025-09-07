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

async function main() {
  const [mode, dateStr] = process.argv.slice(2);
  if (!mode || !dateStr) {
    console.error("Usage: node scripts/generateV75.js <result|startlist> <YYYY-MM-DD>");
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

  let md, outName;
  if (mode === "result") {
    md = generateV75ResultMarkdown(game, dateStr);
    outName = `v75_result_${dateStr}.md`;
  } else if (mode === "startlist") {
    md = await generateV75StartlistMarkdown(game, dateStr);
    outName = `v75_startlista_${dateStr}.md`;
  } else {
    console.error("Mode måste vara 'result' eller 'startlist'.");
    process.exit(3);
  }

  const outDir = path.resolve(process.cwd(), "out");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outPath = path.join(outDir, outName);

  fs.writeFileSync(outPath, md, "utf8");
  console.log(`✔ Skrev ${outPath}`);
}

main().catch(err => {
  console.error("Fel:", err.message || err);
  process.exit(10);
});
