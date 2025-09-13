import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  console.log("🚀 Extraherar riktig V75-data från ATG med Playwright...");

  try {
    const body = await request.json();
    const { baseUrl, divisions } = body;

    if (!baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Base URL krävs för att extrahera data",
        },
        { status: 400 }
      );
    }

    console.log("📍 Extraherar data från base URL:", baseUrl);
    console.log("📍 Avdelningar:", divisions);

    // Kör Playwright-scriptet för att extrahera data
    const { stdout, stderr } = await execAsync(
      `cd v75-scraper && npm run extract-real-data -- "${baseUrl}" "${divisions.join(
        ","
      )}"`
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
        "extracted-atg-data.json"
      );

      if (fs.existsSync(resultPath)) {
        const data = JSON.parse(fs.readFileSync(resultPath, "utf8"));
        console.log("✅ Riktig ATG-data extraherad från Playwright");

        return NextResponse.json({
          success: true,
          data: data,
          source: "atg-playwright-extraction",
          message: `Extraherade ${data.length} avdelningar med riktig data från ATG`,
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
    console.error("❌ Fel vid extraktion med Playwright:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte extrahera riktig data från ATG",
        details: error instanceof Error ? error.message : "Okänt fel",
      },
      { status: 500 }
    );
  }
}
