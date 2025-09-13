// lib/api-atg.js
// API-baserad lösning för V75-data med inloggning

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/**
 * Hämta JSON med enkel felhantering
 */
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Hämta V75 game data
 */
async function fetchV75Game(gameId) {
  const url = `${BASE}/games/${encodeURIComponent(gameId)}`;
  return fetchJSON(url);
}

/**
 * Hämta speltips för en specifik avdelning
 */
async function fetchRaceTips(raceId) {
  try {
    const url = `${BASE}/races/${raceId}/tips-comments`;
    const data = await fetchJSON(url);
    return data;
  } catch (error) {
    console.log(`⚠️ Kunde inte hämta speltips för ${raceId}: ${error.message}`);
    return null;
  }
}

/**
 * Hämta hästdetaljer
 */
async function fetchHorseDetails(horseId) {
  try {
    const url = `${BASE}/horses/${horseId}`;
    const data = await fetchJSON(url);
    return data;
  } catch (error) {
    console.log(
      `⚠️ Kunde inte hämta hästdetaljer för ${horseId}: ${error.message}`
    );
    return null;
  }
}

/**
 * Hämta kalender för ett specifikt datum
 */
async function fetchDay(dateStr) {
  const url = `${BASE}/calendar/day/${dateStr}`;
  return fetchJSON(url);
}

/**
 * Hitta alla gameIds i en kalender-data struktur
 */
function findGameIds(data) {
  const gameIds = new Set();

  function walk(obj) {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(walk);
      } else {
        for (const [key, value] of Object.entries(obj)) {
          if (key === "gameId" && typeof value === "string") {
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
 * Hämta spel/omgång detaljer
 */
async function fetchGame(gameId) {
  const url = `${BASE}/games/${encodeURIComponent(gameId)}`;
  return fetchJSON(url);
}

/**
 * Extrahera hästhistorik från hästdetaljer
 */
function extractHistoryFromHorseDetails(horseDetails) {
  const history = [];

  // Hämta records från statistics
  const records = horseDetails?.statistics?.life?.records || [];

  for (const record of records) {
    if (record.date && record.track && record.driver) {
      history.push({
        date: record.date,
        track: record.track.name || record.track,
        driver: record.driver.name || record.driver,
        position: record.position || "0",
        distance: record.distance || "",
        time: record.time || "",
        shoes: record.shoes || "",
        odds: record.odds || "",
        prize: record.prize || "",
        cart: record.cart || "",
        comment: record.comment || "",
      });
    }
  }

  return history.slice(0, 5); // Max 5 senaste starter
}

/**
 * Hämta hästhistorik för alla hästar i en V75-omgång
 */
async function getV75HorseHistory(gameId) {
  console.log(`🏇 Hämtar hästhistorik för V75-omgång ${gameId}...`);

  try {
    const gameData = await fetchV75Game(gameId);
    const races = gameData?.races || [];
    const horseHistory = {};

    for (let raceIndex = 0; raceIndex < races.length; raceIndex++) {
      const race = races[raceIndex];
      const starts = race?.starts || [];
      const divisionNumber = raceIndex + 1;
      horseHistory[divisionNumber] = {};

      for (const start of starts) {
        const horse = start?.horse || {};
        const horseId = horse.id;
        const horseName = horse.name;
        const horseNumber = start?.number || 0;

        if (horseId && horseNumber > 0) {
          console.log(
            `🐎 Hämtar historik för häst ${horseNumber}: ${horseName} (ID: ${horseId})`
          );

          try {
            const horseDetails = await fetchHorseDetails(horseId);
            const history = extractHistoryFromHorseDetails(horseDetails);
            horseHistory[divisionNumber][horseNumber] = history;
          } catch (error) {
            console.log(
              `⚠️ Kunde inte hämta historik för ${horseName} (${horseId}): ${error.message}`
            );
            horseHistory[divisionNumber][horseNumber] = [];
          }

          // Paus mellan hästar
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    }

    return horseHistory;
  } catch (error) {
    console.log(`💥 Fel vid hämtning av V75-historik: ${error.message}`);
    return {};
  }
}

/**
 * Utility: skyddad sträng
 */
function s(x, fallback = "") {
  if (x === null || x === undefined) return fallback;
  return String(x);
}

/**
 * Formatera rekord
 */
function formatRecord(record) {
  if (!record) return "";
  if (typeof record === "string") return record;
  if (record.time && record.track) {
    return `${record.time} (${record.track})`;
  }
  return record.time || record.track || "";
}

/**
 * Formatera skor
 */
function formatShoes(horse) {
  if (!horse?.shoes) return "";

  const shoes = horse.shoes;
  if (typeof shoes === "string") return shoes;

  const parts = [];
  if (shoes.front) parts.push(`F:${shoes.front}`);
  if (shoes.back) parts.push(`B:${shoes.back}`);

  return parts.join(" ");
}

/**
 * Formatera vagn
 */
function formatWagon(horse) {
  if (!horse?.sulky?.type) return "";
  return horse.sulky.type.code || horse.sulky.type.name || "";
}

/**
 * Formatera V75%
 */
function formatV75Percent(percent) {
  if (!percent) return "";
  if (typeof percent === "number") {
    return percent.toFixed(1) + "%";
  }
  return String(percent);
}

/**
 * Formatera TREND%
 */
function formatTrend(trend) {
  if (trend === null || trend === undefined) return "";
  if (typeof trend === "number") {
    return trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
  }
  return String(trend);
}

/**
 * Formatera V-ODDS
 */
function formatOdds(odds) {
  if (!odds) return "";
  if (typeof odds === "number") {
    return odds.toFixed(2);
  }
  return String(odds);
}

/**
 * Generera komplett V75 startlista med API-data
 */
async function generateCompleteV75StartlistMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const races = game?.races || [];

  const title = `# V75 – utökad startlista ${dateStr}`;

  let md = `${title}\n\n`;

  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const legNumber = i + 1;

    // Hämta speltips för denna avdelning
    const tipsData = await fetchRaceTips(r.id);

    md += `## V75-${legNumber} – ${s(r.name)} \n`;
    md += `*${s(r.distance)} m, ${s(r.startType)}*\n\n`;

    md += `| Nr | Häst/Kusk | V75% | TREND% | V-ODDS | Tränare | Spår | Rekord | Summa | Skor | Vagn | Tipskommentar |\n`;
    md += `|---:|---|---|---:|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|\n`;

    const starts = r?.starts || [];
    for (const st of starts) {
      const v75Percent = formatV75Percent(st?.horse?.v75Percent);
      const trend = formatTrend(st?.horse?.trend);
      const winOdds = formatOdds(st?.odds?.win);

      const trainer = s(st?.trainer?.name);
      const shoes = formatShoes(st?.horse);
      const wagon = formatWagon(st?.horse);

      // Hämta tipskommentar
      let tipComment = "";
      if (tipsData && tipsData.comments) {
        const horseComment = tipsData.comments.find(
          (c) => c.startNumber === st?.number
        );
        if (horseComment) {
          tipComment = horseComment.text;
        }
      }

      const record = formatRecord(st?.horse?.statistics?.life?.bestRecord);
      const earnings = st?.horse?.statistics?.life?.earnings || 0;
      const formattedEarnings = earnings.toLocaleString("sv-SE");

      md += `| ${s(st?.number)} | ${s(st?.horse?.name)} / ${s(
        st?.driver?.name
      )} | ${v75Percent} | ${trend} | ${winOdds} | ${trainer} | ${s(
        st?.postPosition ?? st?.number
      )} | ${record} | ${formattedEarnings} | ${shoes} | ${wagon} | ${s(
        tipComment
      )} |\n`;
    }

    md += `\n`;
  }

  return md;
}

/**
 * Generera hästhistorik markdown
 */
async function generateHistoricalDataMarkdown(game, dateStr, horseHistory) {
  const races = game?.races || [];

  const title = `# V75 – historisk data ${dateStr}`;

  let md = `${title}\n\n`;

  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const legNumber = i + 1;
    const divisionHistory = horseHistory[legNumber] || {};

    md += `## V75-${legNumber} – ${s(r.name)} \n\n`;

    const starts = r?.starts || [];
    for (const st of starts) {
      const horseName = s(st?.horse?.name);
      const horseNumber = st?.number;
      const horseHistoryData = divisionHistory[horseNumber] || [];

      md += `### ${horseName} - Senaste 5 starterna\n\n`;

      if (horseHistoryData.length > 0) {
        md += `| DATUM | BANA | KUSK | PLAC. | DISTANS | KM-TID | SKOR | ODDS | PRIS | VAGN | ANM | LOPPKOMMENTAR |\n`;
        md += `|-------|------|------|-------|---------|--------|------|------|------|------|-----|---------------|\n`;

        for (const history of horseHistoryData) {
          md += `| ${s(history.date)} | ${s(history.track)} | ${s(
            history.driver
          )} | ${s(history.position)} | ${s(history.distance)} | ${s(
            history.time
          )} | ${s(history.shoes)} | ${s(history.odds)} | ${s(
            history.prize
          )} | ${s(history.cart)} | ${s(history.comment)} | ${s(
            history.comment
          )} |\n`;
        }
      } else {
        md += `*Ingen historik tillgänglig*\n`;
      }

      md += `\n`;
    }
  }

  return md;
}

module.exports = {
  fetchV75Game,
  fetchRaceTips,
  fetchHorseDetails,
  getV75HorseHistory,
  generateCompleteV75StartlistMarkdown,
  generateHistoricalDataMarkdown,
};

