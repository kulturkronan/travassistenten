import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🚀 Hämtar V75-data med enkel metod...");

  try {
    const body = await request.json();
    const { url } = body;

    // Extrahera datum från URL om möjligt
    let targetDate = new Date().toISOString().split("T")[0];

    if (url) {
      console.log("📍 Använder URL för att identifiera omgång:", url);

      // Försök extrahera datum från URL
      const dateMatch = url.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        targetDate = dateMatch[1];
        console.log("📅 Datum extraherat från URL:", targetDate);
      }
    }

    // Generera realistisk V75-data baserat på datum
    const v75Data = generateRealisticV75Data(targetDate);

    return NextResponse.json({
      success: true,
      data: v75Data,
      source: "generated",
      message: `V75-data genererad för ${targetDate}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Fel vid generering av V75-data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte generera V75-data",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

function generateRealisticV75Data(date: string) {
  console.log(`🔄 Genererar realistisk V75-data för ${date}...`);

  const races = [];
  const trackNames = [
    "Solvalla",
    "Jägersro",
    "Bergsåker",
    "Halmstad",
    "Örebro",
    "Rättvik",
    "Ronneby",
    "Malmö",
    "Gävle",
    "Åby",
  ];

  const horseNames = [
    "Thunder Strike",
    "Lightning Bolt",
    "Storm Runner",
    "Wind Dancer",
    "Fire Storm",
    "Ice Queen",
    "Golden Arrow",
    "Silver Bullet",
    "Diamond Dust",
    "Crystal Clear",
    "Ocean Wave",
    "Mountain Peak",
    "Forest King",
    "Desert Rose",
    "Sunset Glory",
    "Dawn Breaker",
    "Night Rider",
    "Day Dreamer",
    "Star Gazer",
    "Moon Walker",
  ];

  const driverNames = [
    "Erik Adielsson",
    "Örjan Kihlström",
    "Jorma Kontio",
    "Ulf Ohlsson",
    "Björn Goop",
    "Per Lennartsson",
    "Robert Bergh",
    "Stefan Melander",
    "Daniel Redén",
    "Timo Nurmos",
    "Ari Moilanen",
    "Johan Untersteiner",
    "Sören Nordin",
    "Lars Lindberg",
    "Mika Forss",
    "Johan Persson",
  ];

  // Generera 7 avdelningar
  for (let i = 1; i <= 7; i++) {
    const trackName = trackNames[Math.floor(Math.random() * trackNames.length)];
    const horses = [];

    // Generera 8-12 hästar per avdelning
    const numHorses = 8 + Math.floor(Math.random() * 5);

    for (let j = 1; j <= numHorses; j++) {
      const isScratched = Math.random() < 0.1; // 10% chans att vara struken
      const v75Percent = isScratched
        ? 0
        : Math.round((Math.random() * 20 + 5) * 10) / 10;
      const trendPercent = isScratched
        ? 0
        : Math.round((Math.random() * 20 - 10) * 10) / 10;
      const vOdds = isScratched
        ? 99.99
        : Math.round((Math.random() * 30 + 2) * 100) / 100;
      const pOdds = isScratched
        ? 99.99
        : Math.round((Math.random() * 30 + 2) * 100) / 100;

      horses.push({
        number: j,
        name: horseNames[Math.floor(Math.random() * horseNames.length)],
        driver: driverNames[Math.floor(Math.random() * driverNames.length)],
        track: j,
        record: `${Math.floor(Math.random() * 2 + 1)}.${Math.floor(
          Math.random() * 20 + 10
        )},${Math.floor(Math.random() * 10)}`,
        prizeMoney: Math.floor(Math.random() * 100000 + 50000),
        v75Percent: v75Percent,
        trendPercent: trendPercent,
        vOdds: vOdds,
        pOdds: pOdds,
        shoes: Math.random() < 0.5 ? "CC" : "C",
        wagon: Math.random() < 0.8 ? "Vanlig" : "Special",
        scratched: isScratched,
      });
    }

    races.push({
      raceNumber: i,
      title: `V75-${i} - ${trackName}`,
      distance: `${2000 + Math.floor(Math.random() * 200)}m`,
      trackType: "V75",
      horses: horses,
    });
  }

  console.log(
    `✅ Genererade ${races.length} avdelningar med totalt ${races.reduce(
      (sum, race) => sum + race.horses.length,
      0
    )} hästar`
  );

  return races;
}
