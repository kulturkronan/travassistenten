import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🚀 Hämtar V75-data från ATG API...");

  try {
    const body = await request.json();
    const { url } = body;

    // Extrahera datum från URL om möjligt
    let targetDate = new Date().toISOString().split("T")[0]; // Default till idag

    if (url) {
      console.log("📍 Använder URL för att identifiera omgång:", url);

      // Försök extrahera datum från URL
      const dateMatch = url.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        targetDate = dateMatch[1];
        console.log("📅 Datum extraherat från URL:", targetDate);
      }
    }

    // Hämta data från ATG:s API
    const atgData = await fetchV75FromATGAPI(targetDate);

    return NextResponse.json({
      success: true,
      data: atgData,
      source: "atg-api",
      message: `V75-data hämtad från ATG API för ${targetDate}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Fel vid hämtning från ATG API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta data från ATG API",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

async function fetchV75FromATGAPI(date: string) {
  try {
    console.log(`🌐 Hämtar V75-data för ${date} från ATG API...`);

    // Prova olika ATG API endpoints
    const apiEndpoints = [
      `https://www.atg.se/api/v1/games/V75/${date}`,
      `https://www.atg.se/api/v1/races/V75/${date}`,
      `https://www.atg.se/api/v1/events/V75/${date}`,
      `https://www.atg.se/api/v1/races?gameType=V75&date=${date}`,
      `https://www.atg.se/api/v1/games?type=V75&date=${date}`,
      `https://www.atg.se/api/v1/races?gameType=V75`,
      `https://www.atg.se/api/v1/games?type=V75`,
      `https://www.atg.se/api/v1/races`,
    ];

    let data = null;
    let workingEndpoint = null;

    for (const endpoint of apiEndpoints) {
      try {
        console.log(`🔄 Försöker endpoint: ${endpoint}`);

        const response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://www.atg.se/spel/V75",
            Origin: "https://www.atg.se",
          },
        });

        if (response.ok) {
          data = await response.json();
          workingEndpoint = endpoint;
          console.log(`✅ Data hämtad från: ${endpoint}`);
          break;
        } else {
          console.log(
            `❌ Endpoint ${endpoint} svarade med status ${response.status}`
          );
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint ${endpoint} misslyckades:`, endpointError);
      }
    }

    if (!data) {
      throw new Error("Ingen av ATG:s API endpoints fungerade");
    }

    // Konvertera ATG API-data till vårt format
    return convertATGDataToOurFormat(data, date, workingEndpoint);
  } catch (error) {
    console.error("❌ Fel vid API-anrop:", error);

    // Fallback till mock-data om API:et inte fungerar
    console.log("🔄 Använder fallback-data...");
    return generateFallbackData(date);
  }
}

function convertATGDataToOurFormat(
  atgData: any,
  date: string,
  endpoint?: string
) {
  try {
    console.log("🔄 Konverterar ATG API-data...");
    console.log("📊 ATG data struktur:", Object.keys(atgData));
    console.log("🔗 Endpoint som fungerade:", endpoint);

    // ATG API returnerar data i sitt eget format
    // Vi behöver konvertera det till vårt format
    const races = [];

    // Olika möjliga strukturer från ATG API
    let racesData =
      atgData.races ||
      atgData.data ||
      atgData.games ||
      atgData.events ||
      atgData;

    if (racesData && Array.isArray(racesData)) {
      racesData.forEach((race: any, index: number) => {
        const horses = race.horses
          ? race.horses.map((horse: any) => ({
              number: horse.number || index + 1,
              name: horse.name || `Häst ${index + 1}`,
              driver: horse.driver || `Kusk ${index + 1}`,
              track: horse.track || index + 1,
              record: horse.record || "0.00,0",
              prizeMoney: horse.prizeMoney || 0,
              v75Percent: horse.v75Percent || 0,
              trendPercent: horse.trendPercent || 0,
              vOdds: horse.vOdds || 0,
              pOdds: horse.pOdds || 0,
              shoes: horse.shoes || "CC",
              wagon: horse.wagon || "Vanlig",
              scratched: horse.scratched || false,
            }))
          : [];

        races.push({
          raceNumber: race.raceNumber || index + 1,
          title: race.title || `V75-${index + 1}`,
          distance: race.distance || "2140m",
          trackType: race.trackType || "V75",
          horses: horses,
        });
      });
    }

    return races.length > 0 ? races : generateFallbackData(date);
  } catch (error) {
    console.error("❌ Fel vid konvertering av ATG-data:", error);
    return generateFallbackData(date);
  }
}

function generateFallbackData(date: string) {
  console.log("🔄 Genererar fallback-data...");

  return [
    {
      raceNumber: 1,
      title: `V75-1 - ${date}`,
      distance: "2140m",
      trackType: "V75",
      horses: [
        {
          number: 1,
          name: "API-data inte tillgänglig",
          driver: "Kontrollera ATG API",
          track: 1,
          record: "0.00,0",
          prizeMoney: 0,
          v75Percent: 0,
          trendPercent: 0,
          vOdds: 0,
          pOdds: 0,
          shoes: "CC",
          wagon: "Vanlig",
          scratched: false,
        },
      ],
    },
  ];
}
