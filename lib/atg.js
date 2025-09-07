// lib/atg.js
// Hjälpfunktioner för ATG:s racinginfo-API (V75).

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/** Hämta JSON med enkel felhantering */
async function fetchJSON(url) {
  const res = await fetch(url, {
    // Liten "browser-lik" header brukar hjälpa bakom vissa CDN
    headers: { accept: "application/json,text/plain,*/*" },
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
  if (Array.isArray(games) && games.length > 0) {
    const gameId = games[0].id;
    if (!gameId) {
      return null;
    }
    return gameId;
  }
  return null;
}

/**
 * Hämta hela spelet (alla 7 avdelningar + startlistor+resultat om klara)
 */
async function fetchV75Game(gameId) {
  const url = `${BASE}/games/${gameId}`;
  const data = await fetchJSON(url);

  return data;
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
  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    const raceName = s(r?.name);
    const distance = s(r?.distance);
    const startMethod = s(r?.startMethod); // AUTO/VOLT
    const legNumber = i + 1; // V75-1 till V75-7 baserat på position

    md += `## V75-${legNumber} – ${raceName}\n`;
    md += `*${distance ? distance + " m, " : ""}${
      startMethod ? startMethod : ""
    }*\n\n`;

    // Resultat finns i r.starts[].result.place, kmTime, finalOdds, disq etc.
    const starts = Array.isArray(r?.starts) ? r.starts : [];
    const withResult = starts
      .map((st) => {
        const res = st?.result || {};
        const place = res?.place ?? null;

        // Hantera tid som kan vara ett objekt eller sträng
        let time = "";
        const timeValue = res?.kmTime || res?.time || st?.kmTime;
        if (timeValue) {
          if (typeof timeValue === "object") {
            // Formatera tid som "1.13,3" från objektet {minutes: 1, seconds: 13, tenths: 3}
            const minutes = timeValue.minutes || 0;
            const seconds = timeValue.seconds || 0;
            const tenths = timeValue.tenths || 0;
            time = `${minutes}.${seconds
              .toString()
              .padStart(2, "0")},${tenths}`;
          } else {
            time = s(timeValue);
          }
        }

        // V75 betting percentage från pools.V75.betDistribution (konvertera från hundradelar till procent)
        const v75Distribution = st?.pools?.V75?.betDistribution || 0;
        const v75Percent =
          v75Distribution > 0 ? (v75Distribution / 100).toFixed(1) + "%" : "";

        return {
          place: typeof place === "number" ? place : null,
          number: st?.number,
          post: st?.startNumber ?? st?.postPosition ?? st?.number,
          horse: st?.horse?.name,
          driver: st?.driver?.name || st?.driver?.shortName,
          trainer: st?.trainer?.name,
          time: time,
          v75Percent: v75Percent,
          odds: st?.finalOdds ?? st?.odds ?? "",
          disq: res?.disqualified || st?.disqualified || false,
          galloped: res?.galloped || st?.galloped || false,
          comment: s(res?.comment || st?.comment || ""),
        };
      })
      // sortera: placerade (1..n) först, sedan 0, sedan null (blanka) sist
      .sort((a, b) => {
        // Om båda har null (blanka), behåll ordning
        if (a.place === null && b.place === null) return 0;

        // Om a är null (blank), b ska komma först
        if (a.place === null) return 1;

        // Om b är null (blank), a ska komma först
        if (b.place === null) return -1;

        // Om båda har platser, sortera så att placerade (1+) kommer före 0
        if (a.place === 0 && b.place > 0) return 1; // a=0, b=1+ -> b först
        if (a.place > 0 && b.place === 0) return -1; // a=1+, b=0 -> a först

        // Annars sortera numeriskt
        return a.place - b.place;
      });

    md +=
      "| Pl | Nr | Häst | Kusk | V75% | Tid | Status |\n" +
      "|---:|---:|---|---|---:|---:|---|\n";

    for (const row of withResult) {
      const statusBits = [];
      if (row.disq) statusBits.push("Disk");
      if (row.galloped) statusBits.push("Galopp");
      const status = statusBits.join(", ");

      md += `| ${row.place ?? ""} | ${s(row.number)} | ${s(row.horse)} | ${s(
        row.driver
      )} | ${s(row.v75Percent)} | ${s(row.time)} | ${status} |\n`;
    }

    // Lägg till segermarginal om tillgänglig
    const winningMargin = r?.winningMargin || r?.result?.winningMargin;
    if (winningMargin) {
      md += `\n**Segermarginal:** ${s(winningMargin)}\n\n`;
    }

    // Lägg till rätta kombinationer och odds om tillgänglig
    const combinations = r?.combinations || r?.result?.combinations;
    if (combinations && Array.isArray(combinations)) {
      md += `**Rätta kombinationer och odds:**\n`;
      for (const combo of combinations) {
        const type = combo?.type || "";
        const horses = combo?.horses || combo?.combination || "";
        const odds = combo?.odds || "";
        md += `- **${s(type)}:** ${s(horses)} | ${s(odds)}\n`;
      }
      md += "\n";
    }

    // Lägg till slutlig reservturordning om tillgänglig
    const reserveOrder = r?.reserveOrder || r?.result?.reserveOrder;
    if (reserveOrder) {
      md += `**Slutlig reservturordning:** ${s(reserveOrder)}\n\n`;
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
  const title = `# V75 – utökad startlista ${
    meeting ? meeting + " – " : ""
  }${dateStr}`;

  const races = Array.isArray(game?.races) ? game.races : [];

  let md = `${title}\n\n`;
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
      "| Nr | Häst | Kusk | Tränare | Spår | Hcp | Form | Rekord | Vinstsumma | V75% | TREND% | V | P | SKOR | VAGN |\n" +
      "|---:|---|---|---|---:|---:|---|---:|---|---:|---:|---:|---:|---:|---:|\n";

    const starts = Array.isArray(r?.starts) ? r.starts : [];
    for (const st of starts) {
      // Hantera rekord som kan vara ett objekt
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

      md += `| ${s(st?.number)} | ${s(st?.horse?.name)} | ${s(
        st?.driver?.name || st?.driver?.shortName
      )} | ${s(st?.trainer?.name)} | ${s(
        st?.postPosition ?? st?.startNumber ?? st?.number
      )} | ${s(st?.handicap ?? "")} | ${s(
        st?.horse?.form ?? ""
      )} | ${record} | ${formattedEarnings} | ${v75Percent} | ${trendPercent} | ${winOdds} | ${placeOdds} | ${shoes} | ${wagon} |\n`;

      // Lägg till "Senaste 5 starterna" för denna häst
      md += `\n**Senaste 5 starterna för ${s(st?.horse?.name)}:**\n\n`;
      md += `| DATUM | BANA | KUSK | PLAC. | DISTANS : SPÅR | KM-TID | SKOR | ODDS | PRIS | VAGN | ANM | VIDEO | LOPPKOMMENTAR |\n`;
      md += `|-------|------|------|-------|----------------|--------|------|------|------|------|-----|-------|---------------|\n`;
      
      // Hämta hästhistorik från statistics.records
      const records = st?.horse?.statistics?.life?.records || [];
      const lastFiveRecords = records.slice(0, 5); // Ta de senaste 5
      
      if (lastFiveRecords.length > 0) {
        for (const record of lastFiveRecords) {
          // Formatera datum (om tillgängligt)
          const date = record.year ? record.year : "-";
          
          // Bana (om tillgängligt)
          const track = "-"; // Inte tillgängligt i denna data
          
          // Kusk (om tillgängligt)
          const driver = "-"; // Inte tillgängligt i denna data
          
          // Placering
          const place = record.place !== undefined ? record.place : "-";
          
          // Distans och spår
          const distance = record.distance ? record.distance.toUpperCase() : "-";
          const post = "-"; // Inte tillgängligt
          const distancePost = `${distance} : ${post}`;
          
          // KM-tid
          let kmTime = "-";
          if (record.time && typeof record.time === "object") {
            const minutes = record.time.minutes || 0;
            const seconds = record.time.seconds || 0;
            const tenths = record.time.tenths || 0;
            const startMethod = record.startMethod === "auto" ? "a" : "";
            kmTime = `${minutes}.${seconds.toString().padStart(2, "0")},${tenths}${startMethod}`;
          }
          
          // Skor
          const shoes = "-"; // Inte tillgängligt i denna data
          
          // Odds
          const odds = "-"; // Inte tillgängligt i denna data
          
          // Pris
          const prize = "-"; // Inte tillgängligt i denna data
          
          // Vagn
          const wagon = "-"; // Inte tillgängligt i denna data
          
          // Anmärkningar
          const notes = "-";
          
          // Video
          const video = "-";
          
          // Loppkommentar
          const comment = "-";
          
          md += `| ${date} | ${track} | ${driver} | ${place} | ${distancePost} | ${kmTime} | ${shoes} | ${odds} | ${prize} | ${wagon} | ${notes} | ${video} | ${comment} |\n`;
        }
        
        // Fyll ut med tomma rader om vi har färre än 5 starter
        for (let i = lastFiveRecords.length; i < 5; i++) {
          md += `| - | - | - | - | - | - | - | - | - | - | - | - | - |\n`;
        }
      } else {
        // Inga starter tillgängliga
        for (let i = 0; i < 5; i++) {
          md += `| - | - | - | - | - | - | - | - | - | - | - | - | - |\n`;
        }
      }
      
      md += `\n`;
    }

    // Lägg till speltips om tillgänglig
    const tips = r?.tips || r?.bettingTips || r?.speltips;
    if (tips && Array.isArray(tips) && tips.length > 0) {
      md += `\n### Speltips\n\n`;
      for (const tip of tips) {
        const type = tip?.type || tip?.category || "";
        const horses = tip?.horses || tip?.selections || [];
        const description = tip?.description || tip?.text || "";

        if (horses.length > 0) {
          const horseList = horses
            .map((h) => `${h?.number || ""}. ${h?.name || h?.horse || ""}`)
            .join(", ");
          md += `- **${s(type)}:** ${horseList}\n`;
        } else if (description) {
          md += `- **${s(type)}:** ${s(description)}\n`;
        }
      }
      md += "\n";
    } else {
      // Om inga speltips finns än (t.ex. för framtida lopp)
      md += `\n### Speltips\n\n*Speltips kommer när betting öppnar*\n\n`;
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
