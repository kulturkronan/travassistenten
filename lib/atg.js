// lib/atg.js
// Hjälpfunktioner för ATG:s racinginfo-API (V75).

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/** Hämta JSON med enkel felhantering */
async function fetchJSON(url) {
  const res = await fetch(url, {
    // Liten "browser-lik" header brukar hjälpa bakom vissa CDN
    headers: { "accept": "application/json,text/plain,*/*" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}\n${text}`);
  }
  return res.json();
}

/** 
 * Hämta V75 gameId för ett datum (YYYY-MM-DD).
 * Returnerar t.ex. "V75_2025-09-06_7_5" eller null om ingen V75 då.
 */
async function fetchV75GameId(dateStr) {
  const url = `${BASE}/calendar/day/${dateStr}`;
  const data = await fetchJSON(url);
  // data.games kan se ut som: { "V75": [{ id: "V75_YYYY-MM-DD_track_meetingNo", ... }], ... }
  const games = data?.games?.V75;
  if (Array.isArray(games) && games.length > 0) return games[0].id || null;
  return null;
}

/**
 * Hämta hela spelet (alla 7 avdelningar + startlistor+resultat om klara)
 */
async function fetchV75Game(gameId) {
  const url = `${BASE}/games/${gameId}`;
  return fetchJSON(url);
}

/** Utility: skyddad sträng */
function s(x, fallback = "") {
  if (x === null || x === undefined) return fallback;
  return String(x);
}

/** 
 * Bygg Markdown för RESULTAT av en V75-omgång
 * För varje avdelning: tabell i ordningsföljd 1:a -> …
 */
function generateV75ResultMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const title = `# V75 – resultat ${meeting ? meeting + " – " : ""}${dateStr}`;

  const races = Array.isArray(game?.races) ? game.races : [];

  let md = `${title}\n\n`;
  for (const r of races) {
    const raceName = s(r?.name);
    const distance = s(r?.distance);
    const startMethod = s(r?.startMethod); // AUTO/VOLT
    const leg = s(r?.legNumber || r?.number || ""); // V75-1 .. V75-7

    md += `## ${leg ? `V75-${leg}` : "Avdelning"} – ${raceName}\n`;
    md += `*${distance ? distance + " m, " : ""}${startMethod ? startMethod : ""}*\n\n`;

    // Resultat finns i r.starts[].result.place, kmTime, finalOdds, disq etc.
    const starts = Array.isArray(r?.starts) ? r.starts : [];
    const withResult = starts
      .map(st => {
        const res = st?.result || {};
        const place = res?.place ?? null;
        // Hantera tid som kan vara ett objekt
        let time = "";
        const timeValue = res?.kmTime || res?.time || st?.kmTime;
        if (timeValue) {
          if (typeof timeValue === "object") {
            time = s(timeValue.time || timeValue.kmTime || timeValue.distance || "");
          } else {
            time = s(timeValue);
          }
        }

        return {
          place: typeof place === "number" ? place : null,
          number: st?.number,
          post: st?.startNumber ?? st?.postPosition ?? st?.number,
          horse: st?.horse?.name,
          driver: st?.driver?.name || st?.driver?.shortName,
          trainer: st?.trainer?.name,
          time: time,
          odds: st?.finalOdds ?? st?.odds ?? "",
          disq: res?.disqualified || st?.disqualified || false,
          galloped: res?.galloped || st?.galloped || false,
          comment: s(res?.comment || st?.comment || ""),
        };
      })
      // sortera: place 1..n, därefter övriga (null) längst ned
      .sort((a, b) => {
        if (a.place === null && b.place === null) return 0;
        if (a.place === null) return 1;
        if (b.place === null) return -1;
        return a.place - b.place;
      });

    md +=
      "| Pl | Nr | Häst | Kusk | Tid | Odds | Status |\n" +
      "|---:|---:|---|---|---|---:|---|\n";

    for (const row of withResult) {
      const statusBits = [];
      if (row.disq) statusBits.push("Disk");
      if (row.galloped) statusBits.push("Galopp");
      const status = statusBits.join(", ");

      md += `| ${row.place ?? ""} | ${s(row.number)} | ${s(row.horse)} | ${s(row.driver)} | ${s(row.time)} | ${s(row.odds)} | ${status} |\n`;
    }

    md += "\n";
  }

  return md;
}

/** 
 * Bygg Markdown för UTÖKAD STARTLISTA (inför omgången)
 */
function generateV75StartlistMarkdown(game, dateStr) {
  const meeting = game?.raceDay?.track?.name || game?.tracks?.[0]?.name || "";
  const title = `# V75 – utökad startlista ${meeting ? meeting + " – " : ""}${dateStr}`;

  const races = Array.isArray(game?.races) ? game.races : [];

  let md = `${title}\n\n`;
  for (const r of races) {
    const raceName = s(r?.name);
    const distance = s(r?.distance);
    const startMethod = s(r?.startMethod);
    const leg = s(r?.legNumber || r?.number || "");

    md += `## ${leg ? `V75-${leg}` : "Avdelning"} – ${raceName}\n`;
    md += `*${distance ? distance + " m, " : ""}${startMethod ? startMethod : ""}*\n\n`;

    md +=
      "| Nr | Häst | Kusk | Tränare | Spår | Hcp | Form | Vinstsumma |\n" +
      "|---:|---|---|---|---:|---:|---|---:|\n";

    const starts = Array.isArray(r?.starts) ? r.starts : [];
    for (const st of starts) {
      md += `| ${s(st?.number)} | ${s(st?.horse?.name)} | ${s(st?.driver?.name || st?.driver?.shortName)} | ${s(st?.trainer?.name)} | ${s(st?.postPosition ?? st?.startNumber ?? st?.number)} | ${s(st?.handicap ?? "")} | ${s(st?.horse?.form ?? "")} | ${s(st?.horse?.money ?? st?.horse?.earnings ?? "")} |\n`;
    }

    md += "\n";
  }

  return md;
}

module.exports = {
  fetchV75GameId,
  fetchV75Game,
  generateV75ResultMarkdown,
  generateV75StartlistMarkdown,
};
