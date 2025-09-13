import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  console.log("🚀 Hämtar nästa V75-omgång...");

  try {
    return await fetchV75Data();
  } catch (error) {
    console.error("❌ Fel vid hämtning av nästa V75:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta nästa V75-omgång",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 Hämtar V75-omgång från specificerad URL...");

  try {
    const body = await request.json();
    const { url } = body;

    if (url) {
      console.log("📍 Använder specificerad URL:", url);
      return await fetchV75DataFromUrl(url);
    } else {
      console.log("🔄 Ingen URL specificerad, använder standard-metod");
      return await fetchV75Data();
    }
  } catch (error) {
    console.error("❌ Fel vid hämtning av V75 från URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta V75 från URL",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

async function fetchV75Data() {
  try {
    // Försök hämta data från befintliga JSON-filer först
    const dataFiles = [
      "v75-working-complete.json",
      "v75-improved-complete.json",
      "v75-detailed-complete.json",
      "v75-improved-data.json",
      "v75-detailed-data.json",
    ];

    let raceData = null;
    let dataSource = "";

    for (const fileName of dataFiles) {
      const filePath = path.join(process.cwd(), "v75-scraper", fileName);
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(fileContent);

          if (data && data.length > 0) {
            raceData = data;
            dataSource = fileName;
            console.log(`✅ Använder data från ${fileName}`);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Kunde inte läsa ${fileName}:`, error);
        }
      }
    }

    // Om ingen data hittades, starta en ny scraping-session
    if (!raceData) {
      console.log(
        "🔄 Ingen befintlig data hittades, startar ny scraping-session..."
      );

      const scriptPath = path.join(
        process.cwd(),
        "v75-scraper",
        "dist",
        "working-session.js"
      );

      // Kontrollera om scriptet finns
      if (!fs.existsSync(scriptPath)) {
        console.log("⚠️ Scraping script inte hittat, använder fallback-data");
        raceData = [
          {
            raceNumber: 1,
            title: "V75-1 - Ingen data tillgänglig",
            distance: "2140m",
            trackType: "V75",
            horses: [
              {
                number: 1,
                name: "Ingen data",
                driver: "Kontrollera scraping",
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
        dataSource = "no-data";
      } else {
        // Kör scraping-scriptet i bakgrunden
        execAsync(`node ${scriptPath}`, {
          cwd: path.join(process.cwd(), "v75-scraper"),
        })
          .then(({ stdout, stderr }) => {
            console.log("Scraping script stdout:", stdout);
            if (stderr) console.error("Scraping script stderr:", stderr);
          })
          .catch((error) => {
            console.error("Error running scraping script:", error);
          });

        // Returnera fallback-data medan scraping pågår
        raceData = [
          {
            raceNumber: 1,
            title: "V75-1 - Hämtar nästa omgång...",
            distance: "2140m",
            trackType: "V75",
            horses: [
              {
                number: 1,
                name: "Laddar data...",
                driver: "Väntar",
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
        dataSource = "scraping-in-progress";
      }
    }

    return NextResponse.json({
      success: true,
      data: raceData,
      source: dataSource,
      message:
        dataSource === "fallback"
          ? "Hämtar nästa V75-omgång i bakgrunden..."
          : `Data hämtad från ${dataSource}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Fel vid hämtning av nästa V75:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta nästa V75-omgång",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}

async function fetchV75DataFromUrl(url: string) {
  try {
    console.log("🌐 Hämtar data från URL:", url);

    // Validera URL
    if (!url.includes("atg.se")) {
      throw new Error("URL måste vara från ATG (atg.se)");
    }

    // Kontrollera om det är en V75-sida (mer flexibel kontroll)
    const isV75Page =
      url.toLowerCase().includes("v75") ||
      url.toLowerCase().includes("spel") ||
      url.includes("/V75") ||
      url.includes("/v75");

    if (!isV75Page) {
      console.log("⚠️ URL verkar inte vara en V75-sida, men försöker ändå...");
    }

    // Skapa en anpassad scraping-session med den specifika URL:en
    const scriptPath = path.join(
      process.cwd(),
      "v75-scraper",
      "dist",
      "working-session.js"
    );

    if (!fs.existsSync(scriptPath)) {
      throw new Error("Scraping script inte hittat");
    }

    // Kör scraping-scriptet med URL som parameter
    console.log(`🔄 Startar scraping-session med URL: ${url}`);
    execAsync(`node ${scriptPath} "${url}"`, {
      cwd: path.join(process.cwd(), "v75-scraper"),
    })
      .then(({ stdout, stderr }) => {
        console.log("✅ Scraping script slutfört");
        console.log("Scraping script stdout:", stdout);
        if (stderr) console.error("Scraping script stderr:", stderr);
      })
      .catch((error) => {
        console.error("❌ Error running scraping script:", error);
      });

    // Returnera fallback-data medan scraping pågår
    const raceData = [
      {
        raceNumber: 1,
        title: "V75-1 - Hämtar från specificerad URL...",
        distance: "2140m",
        trackType: "V75",
        horses: [
          {
            number: 1,
            name: "Laddar från URL...",
            driver: "Väntar",
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

    return NextResponse.json({
      success: true,
      data: raceData,
      source: "url-scraping",
      message: `Hämtar data från specificerad URL: ${url}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Fel vid hämtning från URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta data från URL",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}
