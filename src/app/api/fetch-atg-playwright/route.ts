import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  console.log("🚀 Hämtar V75-data med Playwright...");

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

    // Kör Playwright-skriptet för att hämta data
    const { stdout, stderr } = await execAsync(
      `cd v75-scraper && npm run fetch-v75 -- "${baseUrl}"`
    );

    if (stderr) {
      console.error("Playwright stderr:", stderr);
    }

    console.log("Playwright stdout:", stdout);

    // Försök läsa resultatet från filen
    try {
      const fs = require("fs");
      const path = require("path");
      const resultPath = path.join(
        process.cwd(),
        "v75-scraper",
        "v75-data.json"
      );

      if (fs.existsSync(resultPath)) {
        const data = JSON.parse(fs.readFileSync(resultPath, "utf8"));
        console.log("✅ Data läst från Playwright-resultat");

        return NextResponse.json({
          success: true,
          data: data,
          source: "atg-playwright",
          message: `Hämtade ${data.length} avdelningar från ATG med Playwright`,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error("Playwright-resultatfil hittades inte");
      }
    } catch (fileError) {
      console.error("Fel vid läsning av Playwright-resultat:", fileError);
      throw fileError;
    }
  } catch (error) {
    console.error("❌ Fel vid hämtning med Playwright:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte hämta data med Playwright",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}
