import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  console.log("🚀 Hämtar riktig V75-data från ATG...");

  try {
    const body = await request.json();
    const { baseUrl } = body;

    if (!baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Base URL krävs för att hämta alla avdelningar",
        },
        { status: 400 }
      );
    }

    console.log("📍 Hämtar data från base URL:", baseUrl);

    // Kör den riktiga ATG-scrapern
    const { stdout, stderr } = await execAsync(
      `cd v75-scraper && npm run scrape-real -- "${baseUrl}"`
    );

    if (stderr) {
      console.error("Scraper stderr:", stderr);
    }

    console.log("Scraper stdout:", stdout);

    // Försök läsa resultatet från filen
    try {
      const fs = require("fs");
      const path = require("path");
      const resultPath = path.join(
        process.cwd(),
        "v75-scraper",
        "real-atg-data.json"
      );

      if (fs.existsSync(resultPath)) {
        const data = JSON.parse(fs.readFileSync(resultPath, "utf8"));
        console.log("✅ Riktig ATG-data läst från scraper-resultat");

        return NextResponse.json({
          success: true,
          data: data,
          source: "atg-real-scraper",
          message: `Hämtade ${data.length} avdelningar med riktig data från ATG`,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("Scraper-resultatfil hittades inte");
      }
    } catch (fileError) {
      console.error("Fel vid läsning av scraper-resultat:", fileError);
      throw fileError;
    }
  } catch (error) {
    console.error("❌ Fel vid hämtning med riktig scraper:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta riktig data från ATG",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}
