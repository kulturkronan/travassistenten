import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Startar synkroniseringssession...");

    // Starta Playwright-browser
    const browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Gå till ATG V75-sidan
    console.log("🌐 Navigerar till ATG V75...");
    await page.goto("https://www.atg.se/spel/V75", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Vänta på att sidan laddas
    await page.waitForTimeout(3000);

    // Ta screenshot
    await page.screenshot({
      path: "v75-scraper/screenshots/sync-session-start.png",
    });

    console.log("✅ Browser öppnad och redo för inloggning");

    // Spara browser-instansen (i en verklig implementation skulle vi använda en session store)
    // För nu returnerar vi success
    return NextResponse.json({
      success: true,
      message: "Browser öppnad. Logga in på ATG för att fortsätta.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Fel vid start av synkroniseringssession:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Kunde inte starta synkroniseringssession",
        details: error instanceof Error ? error.message : "Okänt fel",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
