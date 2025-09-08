// lib/atg-history.js
// Hämta hästhistorik via ATG:s odokumenterade JSON-API

const BASE = "https://www.atg.se/services/racinginfo/v1/api";

/**
 * Hämta JSON med enkel felhantering
 */
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}\n${text}`);
  }
  return res.json();
}

/**
 * Hämta kalender för en dag
 */
async function fetchDay(dateStr) {
  const url = `${BASE}/calendar/day/${dateStr}`;
  return fetchJSON(url);
}

/**
 * Hämta spel/omgång detaljer
 */
async function fetchGame(gameId) {
  const url = `${BASE}/games/${encodeURIComponent(gameId)}`;
  return fetchJSON(url);
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
 * Hämta hästhistorik för en specifik häst
 */
async function getHorseHistory(horseName, daysBack = 120) {
  console.log(
    `🔍 Söker efter hästhistorik för "${horseName}" (${daysBack} dagar tillbaka)...`
  );

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const allStarts = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    console.log(`📅 Kontrollerar ${dateStr}...`);

    try {
      const dayData = await fetchDay(dateStr);
      const gameIds = findGameIds(dayData);

      console.log(`🎯 Hittade ${gameIds.length} spel för ${dateStr}`);

      for (const gameId of gameIds) {
        try {
          const gameData = await fetchGame(gameId);
          const races = gameData?.races || [];

          for (const race of races) {
            const starts = race?.starts || [];

            for (const start of starts) {
              const horse = start?.horse || {};
              const horseNameInData = horse.name || "";

              if (
                horseNameInData.toLowerCase().includes(horseName.toLowerCase())
              ) {
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
                  date: gameData?.startTime || race?.startTime || dateStr,
                  track:
                    gameData?.track?.name || race?.track?.name || "Okänd bana",
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

                allStarts.push(startData);
                console.log(
                  `✅ Hittade start: ${startData.date} ${startData.track}-${startData.raceNumber} (${startData.position})`
                );
              }
            }
          }
        } catch (error) {
          console.log(`⚠️ Fel vid hämtning av ${gameId}: ${error.message}`);
        }

        // Kort paus för att vara snäll mot servern
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.log(`⚠️ Fel vid hämtning av ${dateStr}: ${error.message}`);
    }

    currentDate.setDate(currentDate.getDate() + 1);

    // Paus mellan dagar
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Sortera efter datum (nyast först)
  allStarts.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(
    `🎉 Hittade totalt ${allStarts.length} starter för "${horseName}"`
  );
  return allStarts.slice(0, 20); // Returnera max 20 senaste starter
}

/**
 * Hämta hästhistorik för alla hästar i en V75-omgång
 */
async function getV75HorseHistory(gameId) {
  console.log(`🏇 Hämtar hästhistorik för V75-omgång ${gameId}...`);

  try {
    const gameData = await fetchGame(gameId);
    const races = gameData?.races || [];
    const horseHistory = {};

    for (const race of races) {
      const starts = race?.starts || [];

      for (const start of starts) {
        const horse = start?.horse || {};
        const horseName = horse.name;
        const horseNumber = start?.number || 0;

        if (horseName && horseNumber > 0) {
          console.log(
            `🐎 Hämtar historik för häst ${horseNumber}: ${horseName}`
          );

          try {
            const history = await getHorseHistory(horseName, 365); // 1 år tillbaka
            horseHistory[horseNumber] = history.slice(0, 5); // Max 5 senaste starter
          } catch (error) {
            console.log(
              `⚠️ Kunde inte hämta historik för ${horseName}: ${error.message}`
            );
            horseHistory[horseNumber] = [];
          }

          // Paus mellan hästar
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    return horseHistory;
  } catch (error) {
    console.log(`💥 Fel vid hämtning av V75-historik: ${error.message}`);
    return {};
  }
}

module.exports = {
  getHorseHistory,
  getV75HorseHistory,
  fetchDay,
  fetchGame,
};
