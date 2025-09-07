#!/usr/bin/env node

import { chromium, Browser, Page } from "playwright";
import { V75Data, DivisionData, HorseData, CliArgs } from "./schemas.js";
import { extractShoeFromElement } from "./shoeNormalizer.js";
import { MarkdownWriter } from "./markdownWriter.js";
import dotenv from "dotenv";

// Ladda miljövariabler
dotenv.config();

interface ScraperConfig {
  baseUrl: string;
  userAgent: string;
  timeout: number;
  retryAttempts: number;
}

class V75Scraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;

  constructor() {
    this.config = {
      baseUrl: "https://www.atg.se/spel",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      timeout: 30000,
      retryAttempts: 3,
    };
  }

  async initialize(): Promise<void> {
    console.log("Startar browser...");
    this.browser = await chromium.launch({
      headless: false, // Visa browser för att hantera cookies
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Hanterar cookies-rutan om den visas
   */
  private async handleCookieConsent(page: Page): Promise<void> {
    try {
      // Vänta längre på att cookies-rutan ska visas
      await page.waitForTimeout(5000);

      // Olika selektorer för cookies-accept-knappar
      const cookieSelectors = [
        // ATG-specifika selektorer baserat på popupen
        'button:has-text("Godkänn alla cookies")',
        'button:has-text("Godkänn alla")',
        'button:has-text("Acceptera alla")',
        'button:has-text("Accept all")',
        'button:has-text("Endast nödvändiga")',
        'button:has-text("Only necessary")',
        // Generiska selektorer
        "#onetrust-accept-btn-handler",
        "#onetrust-reject-all-handler",
        '[id*="accept"]',
        '[id*="cookie"]',
        'button[class*="accept"]',
        'button[class*="cookie"]',
        'button[class*="green"]', // ATG använder gröna knappar
        ".cookie-accept",
        ".accept-cookies",
        '[data-testid*="accept"]',
        '[data-testid*="cookie"]',
        // Leta efter knappar i cookie-popupen
        'div:has-text("Vi använder cookies") button',
        'div:has-text("cookies") button[class*="green"]',
        'div:has-text("cookies") button:has-text("Godkänn")',
        // MUI-specifika selektorer
        '[class*="MuiButton"]:has-text("Godkänn")',
        '[class*="MuiButton"]:has-text("Acceptera")',
        '[class*="MuiButton"]:has-text("Accept")',
      ];

      let cookieHandled = false;
      for (const selector of cookieSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              console.log(`Hittade cookies-knapp: ${selector}`);
              await element.click();
              console.log("Klickade på cookies-accept");
              await page.waitForTimeout(3000); // Vänta längre efter klick
              cookieHandled = true;
              return;
            }
          }
        } catch (error) {
          // Ignorera fel och försök nästa selector
        }
      }

      // Fallback: försök hitta knappen med JavaScript
      if (!cookieHandled) {
        console.log("Försöker hitta cookies-knapp med JavaScript...");
        try {
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const cookieButton = buttons.find(
              (btn) =>
                btn.textContent?.includes("Godkänn") ||
                btn.textContent?.includes("Acceptera") ||
                btn.textContent?.includes("Accept") ||
                btn.textContent?.includes("cookies")
            );
            if (cookieButton) {
              (cookieButton as HTMLButtonElement).click();
              console.log("Klickade på cookies-knapp via JavaScript");
            }
          });
          await page.waitForTimeout(2000);
        } catch (error) {
          console.log("Ingen cookies-ruta hittades eller redan accepterad");
        }
      }
    } catch (error) {
      console.warn("Fel vid hantering av cookies:", error);
    }
  }

  /**
   * Klickar på "Utöka alla" för att få den utökade startlistan
   */
  private async expandAllHorses(page: Page): Promise<void> {
    try {
      console.log('Söker efter "Utöka alla" knapp...');

      // Olika selektorer för "Utöka alla" knappen
      const expandSelectors = [
        'button:has-text("Utöka alla")',
        'button:has-text("+ Utöka alla")',
        '[data-testid*="expand"]',
        '[data-testid*="utöka"]',
        'button[class*="expand"]',
        'button[class*="utöka"]',
        'button:contains("Utöka")',
        'button:contains("utöka")',
        'button:contains("Expand")',
        'button:contains("expand")',
        '[aria-label*="utöka"]',
        '[aria-label*="expand"]',
        '[title*="utöka"]',
        '[title*="expand"]',
      ];

      for (const selector of expandSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              console.log(`Hittade "Utöka alla" knapp: ${selector}`);
              await element.click();
              console.log('Klickade på "Utöka alla"');
              await page.waitForTimeout(3000); // Vänta på att innehållet expanderas
              return;
            }
          }
        } catch (error) {
          // Ignorera fel och försök nästa selector
        }
      }

      console.log('Ingen "Utöka alla" knapp hittades');
    } catch (error) {
      console.warn("Fel vid expandering av hästar:", error);
    }
  }

  /**
   * Klickar på speltips för att expandera den sektionen
   */
  private async expandSpeltips(page: Page): Promise<void> {
    try {
      console.log("Söker efter speltips-knapp...");

      // Olika selektorer för speltips-knappen
      const speltipsSelectors = [
        // Direkta text-matchningar
        'button:has-text("Speltips")',
        'button:has-text("+ Speltips")',
        'button:has-text("Speltips för")',
        'button:has-text("Speltips för lopp")',
        'button:has-text("Speltips för avdelning")',
        // Data-testid selektorer
        '[data-testid*="speltips"]',
        '[data-testid*="tips"]',
        '[data-testid*="expand"]',
        '[data-testid*="collapse"]',
        // Class-baserade selektorer
        'button[class*="speltips"]',
        'button[class*="tips"]',
        'button[class*="expand"]',
        'button[class*="collapse"]',
        'button[class*="toggle"]',
        // Aria-label och title selektorer
        '[aria-label*="speltips"]',
        '[aria-label*="tips"]',
        '[aria-label*="expand"]',
        '[title*="speltips"]',
        '[title*="tips"]',
        '[title*="expand"]',
        // Specifika selektorer för speltips-sektionen
        'div:has-text("Speltips") button',
        'div:has-text("Speltips") [class*="expand"]',
        'div:has-text("Speltips") [class*="collapse"]',
        'div:has-text("Speltips") [class*="toggle"]',
        'div:has-text("Speltips") [class*="plus"]',
        // Leta efter + tecken nära speltips-text
        'div:has-text("Speltips") + button',
        'div:has-text("Speltips") ~ button',
        'div:has-text("Speltips") button:has-text("+")',
        // MUI-specifika selektorer
        '[class*="MuiButton"]:has-text("Speltips")',
        '[class*="MuiIconButton"]:has-text("+")',
        '[class*="MuiButtonBase"]:has-text("Speltips")',
        // Generiska expand/collapse knappar
        'button[class*="expand"]:has-text("+")',
        'button[class*="collapse"]:has-text("-")',
        'button[class*="toggle"]:has-text("+")',
        'button[class*="toggle"]:has-text("-")',
      ];

      for (const selector of speltipsSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              console.log(`Hittade speltips-knapp: ${selector}`);
              await element.click();
              console.log("Klickade på speltips");
              await page.waitForTimeout(2000); // Vänta på att innehållet expanderas
              return;
            }
          }
        } catch (error) {
          // Ignorera fel och försök nästa selector
        }
      }

      console.log("Ingen speltips-knapp hittades");
    } catch (error) {
      console.warn("Fel vid expandering av speltips:", error);
    }
  }

  async scrapeV75(
    date: string,
    track: string,
    bane?: string
  ): Promise<V75Data> {
    if (!this.browser) {
      throw new Error("Browser inte initialiserad");
    }

    const page = await this.browser.newPage();

    try {
      await page.setExtraHTTPHeaders({
        "User-Agent": this.config.userAgent,
      });
      await page.setViewportSize({ width: 1920, height: 1080 });

      const divisions: DivisionData[] = [];

      // Scrapa varje avdelning (1-7)
      for (let avd = 1; avd <= 7; avd++) {
        console.log(`Scrapar avdelning ${avd}...`);

        const divisionData = await this.scrapeDivision(
          page,
          date,
          track,
          avd,
          bane
        );
        divisions.push(divisionData);

        // Kort paus mellan avdelningar
        await page.waitForTimeout(1000);
      }

      const v75Data: V75Data = {
        date,
        track,
        divisions,
      };

      return v75Data;
    } finally {
      await page.close();
    }
  }

  private async scrapeDivision(
    page: Page,
    date: string,
    track: string,
    divisionNumber: number,
    bane?: string
  ): Promise<DivisionData> {
    const url = `${this.config.baseUrl}/${date}/V75/${track}/avd/${divisionNumber}`;
    if (bane) {
      // Lägg till bane-parameter om specificerad
      const urlWithBane = `${url}?bane=${encodeURIComponent(bane)}`;
      console.log(`Laddar: ${urlWithBane}`);
    } else {
      console.log(`Laddar: ${url}`);
    }

    let attempts = 0;
    while (attempts < this.config.retryAttempts) {
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: this.config.timeout,
        });

        // Hantera cookies-rutan om den visas
        await this.handleCookieConsent(page);

        // Vänta på att React-appen laddas
        await page.waitForTimeout(5000);

        // Vänta på att startlistan laddas
        await page.waitForSelector(
          '[data-test="startlist-row"], .StartListRow, .startlist-row, [class*="horse"], [class*="start"]',
          {
            timeout: 15000,
          }
        );

        // Klicka på "Utöka alla" för att få den utökade startlistan
        await this.expandAllHorses(page);

        // Klicka på speltips för att expandera den sektionen
        await this.expandSpeltips(page);

        // Vänta lite extra efter expandering
        await page.waitForTimeout(2000);

        const horses = await this.extractHorsesFromPage(page);
        const speltips = await this.extractSpeltipsFromPage(page);

        return {
          divisionNumber,
          horses,
          speltips,
        };
      } catch (error) {
        attempts++;
        console.warn(
          `Försök ${attempts} misslyckades för avdelning ${divisionNumber}:`,
          error
        );

        if (attempts < this.config.retryAttempts) {
          await page.waitForTimeout(2000);
        } else {
          throw new Error(
            `Kunde inte scrapa avdelning ${divisionNumber} efter ${this.config.retryAttempts} försök`
          );
        }
      }
    }

    throw new Error("Oväntat fel i scrapeDivision");
  }

  private async extractHorsesFromPage(page: Page): Promise<HorseData[]> {
    // Olika selektorer för att hitta hästrader - baserat på faktisk ATG-struktur
    const rowSelectors = [
      // ATG-specifika selektorer baserat på faktisk HTML
      '[class*="HorseTableRow"]',
      'tr[class*="HorseTableRow"]',

      // Data attributes
      '[data-testid*="horse"]',
      '[data-testid*="start"]',
      '[data-testid*="race"]',
      '[data-testid*="runner"]',

      // Class-based selectors
      '[class*="horse"]',
      '[class*="start"]',
      '[class*="race"]',
      '[class*="runner"]',
      '[class*="entry"]',
      '[class*="participant"]',

      // Generic selectors
      'div[role="row"]',
      'div[role="listitem"]',
      'li[role="listitem"]',
      "tr",
      'div[class*="row"]',
      'div[class*="item"]',

      // ATG-specific patterns
      '[class*="StartList"]',
      '[class*="RaceCard"]',
      '[class*="HorseCard"]',
      '[class*="Entry"]',
      '[class*="Participant"]',

      // Legacy selectors
      '[data-test="startlist-row"]',
      ".StartListRow",
      ".startlist-row",
      ".horse-row",
      "tr[data-horse]",
      ".race-horse",
    ];

    let horses: HorseData[] = [];

    for (const selector of rowSelectors) {
      try {
        const rows = await page.$$(selector);
        if (rows.length > 0) {
          console.log(
            `Hittade ${rows.length} hästar med selector: ${selector}`
          );
          horses = await this.extractHorsesFromRows(rows);
          if (horses.length > 0) {
            break; // Använd första selector som ger resultat
          }
        }
      } catch (error) {
        console.warn(`Selector ${selector} misslyckades:`, error);
      }
    }

    if (horses.length === 0) {
      console.warn("Inga hästar hittades, försöker generisk approach...");
      // Fallback: leta efter alla rader som kan innehålla hästdata
      const allRows = await page.$$(
        'tr, .row, [class*="horse"], [class*="start"], div, li'
      );
      horses = await this.extractHorsesFromRows(allRows);
    }

    return horses;
  }

  private async extractHorsesFromRows(rows: any[]): Promise<HorseData[]> {
    const horses: HorseData[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const horseData = await this.extractHorseFromRow(row, i + 1);

        if (horseData) {
          horses.push(horseData);
        }
      } catch (error) {
        console.warn(`Fel vid extrahering av häst ${i + 1}:`, error);
      }
    }

    return horses;
  }

  /**
   * Extraherar speltips-data från sidan
   */
  private async extractSpeltipsFromPage(page: Page): Promise<any> {
    try {
      console.log("Extraherar speltips-data...");

      const speltips: any = {};

      // Sök efter Rank A, B, C
      const rankElements = await page.$$(
        'div:has-text("Rank"), div:has-text("A:"), div:has-text("B:"), div:has-text("C:")'
      );
      for (const element of rankElements) {
        const text = await element.innerText();
        if (text.includes("Rank A:") || text.includes("A:")) {
          const rankA =
            text
              .match(/A:\s*([0-9,\s]+)/)?.[1]
              ?.split(",")
              .map((n) => n.trim())
              .filter((n) => n) || [];
          speltips.rankA = rankA;
        }
        if (text.includes("Rank B:") || text.includes("B:")) {
          const rankB =
            text
              .match(/B:\s*([0-9,\s]+)/)?.[1]
              ?.split(",")
              .map((n) => n.trim())
              .filter((n) => n) || [];
          speltips.rankB = rankB;
        }
        if (text.includes("Rank C:") || text.includes("C:")) {
          const rankC =
            text
              .match(/C:\s*([0-9,\s]+)/)?.[1]
              ?.split(",")
              .map((n) => n.trim())
              .filter((n) => n) || [];
          speltips.rankC = rankC;
        }
      }

      // Sök efter Spetsanalys
      const spetsanalysElements = await page.$$(
        'div:has-text("Spetsanalys"), div:has-text("spetsanalys")'
      );
      for (const element of spetsanalysElements) {
        const text = await element.innerText();
        if (text.toLowerCase().includes("spetsanalys")) {
          speltips.paceAnalysis = text;
          break;
        }
      }

      // Sök efter källa
      const sourceElements = await page.$$(
        'div:has-text("Källa:"), div:has-text("Source:")'
      );
      for (const element of sourceElements) {
        const text = await element.innerText();
        if (text.includes("Källa:") || text.includes("Source:")) {
          speltips.source = text;
          break;
        }
      }

      // Sök efter detaljerade tips
      const tipElements = await page.$$(
        'div:has-text("Detaljerade tips"), div:has-text("Tips")'
      );
      const detailedTips: any[] = [];

      for (const element of tipElements) {
        const text = await element.innerText();
        if (text.includes("Detaljerade tips") || text.includes("Tips")) {
          // Försök extrahera hästnummer och beskrivningar
          const lines = text.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            const match = line.match(/(\d+)\s+([^:]+):\s*(.+)/);
            if (match) {
              detailedTips.push({
                horseNumber: match[1],
                horseName: match[2].trim(),
                description: match[3].trim(),
              });
            }
          }
        }
      }

      if (detailedTips.length > 0) {
        speltips.detailedTips = detailedTips;
      }

      console.log("Speltips-data extraherad:", speltips);
      return speltips;
    } catch (error) {
      console.warn("Fel vid extrahering av speltips:", error);
      return {};
    }
  }

  private async extractHorseFromRow(
    row: any,
    rowIndex: number
  ): Promise<HorseData | null> {
    try {
      // Först försök att extrahera data från hela radens text
      const fullText = await row.innerText();
      const lines = fullText.split("\n").filter((line: string) => line.trim());

      if (lines.length >= 6) {
        // Försök att extrahera data från texten direkt
        const horseNumber = this.parseHorseNumber(lines[0]);
        const horseName = lines[1]?.trim() || "";
        const driver = lines[2]?.trim() || "";
        const trainer = lines[3]?.trim() || "";
        const v75Percent = lines[4]?.trim() || "";
        const trend = lines[5]?.trim() || "";
        const odds = lines[6]?.trim() || "";
        // Försök hitta sko-data från rätt kolumn (oftast kolumn 8 eller 9)
        let shoes = "";
        for (let i = 7; i < Math.min(lines.length, 10); i++) {
          const potentialShoes = lines[i]?.trim() || "";
          if (
            potentialShoes &&
            (potentialShoes.includes("barfota") ||
              potentialShoes.includes("skor") ||
              potentialShoes.includes("cc") ||
              potentialShoes.includes("c̶"))
          ) {
            shoes = potentialShoes;
            break;
          }
        }

        if (horseNumber && horseName && driver && trainer) {
          return {
            name: horseName,
            number: horseNumber,
            driver: driver,
            trainer: trainer,
            v75Percent: v75Percent || undefined,
            trend: trend || undefined,
            odds: odds || undefined,
            shoes: (this.normalizeShoeText(shoes) as any) || undefined,
          };
        }
      }

      // Fallback till selektorer om text-extraktion misslyckades
      const nameSelectors = [
        // ATG-specifika data-test-id attribut
        '[data-test-id*="horse-name"]',
        '[data-test-id*="name"]',
        '[data-test-id*="runner"]',
        '[data-test-id*="horse"]',

        // Data attributes
        '[data-testid*="horse-name"]',
        '[data-testid*="name"]',
        '[data-testid*="runner"]',

        // Class-based selectors
        '[class*="horse-name"]',
        '[class*="runner-name"]',
        '[class*="name"]',
        '[class*="horse"]',

        // Generic selectors
        ".horse-name",
        ".horse-name-selector",
        '[data-test="horse-name"]',
        ".name",
        ".horse",
        ".runner-name",
        "td:nth-child(1)",
        "td:first-child",
        "span",
        "div",
        "p",
      ];

      const numberSelectors = [
        // Data attributes
        '[data-testid*="number"]',
        '[data-testid*="start-number"]',

        // Class-based selectors
        '[class*="number"]',
        '[class*="start-number"]',
        '[class*="position"]',

        // Generic selectors
        ".horse-number",
        ".number",
        ".start-number",
        '[data-test="horse-number"]',
        "td:nth-child(2)",
        "td:nth-child(1)",
        "span",
        "div",
      ];

      const driverSelectors = [
        // Data attributes
        '[data-testid*="driver"]',
        '[data-testid*="jockey"]',
        '[data-testid*="kusk"]',

        // Class-based selectors
        '[class*="driver"]',
        '[class*="jockey"]',
        '[class*="kusk"]',

        // Generic selectors
        ".driver",
        ".driver-selector",
        ".jockey",
        '[data-test="driver"]',
        "td:nth-child(3)",
        "td:nth-child(4)",
        "span",
        "div",
      ];

      const trainerSelectors = [
        // Data attributes
        '[data-testid*="trainer"]',
        '[data-testid*="trainer"]',

        // Class-based selectors
        '[class*="trainer"]',
        '[class*="tränare"]',

        // Generic selectors
        ".trainer",
        ".trainer-selector",
        '[data-test="trainer"]',
        "td:nth-child(4)",
        "td:nth-child(5)",
        "span",
        "div",
      ];

      const v75Selectors = [
        // ATG-specifika data-test-id attribut
        '[data-test-id*="bet-distribution"]',
        '[data-test-id*="v75"]',
        '[data-test-id*="percent"]',

        // Data attributes
        '[data-testid*="v75"]',
        '[data-testid*="percent"]',

        // Class-based selectors
        '[class*="v75"]',
        '[class*="percent"]',
        '[class*="percentage"]',

        // Generic selectors
        ".v75-percent",
        ".v75",
        ".percentage",
        '[data-test="v75-percent"]',
        "td:nth-child(5)",
        "td:nth-child(6)",
        "span",
        "div",
      ];

      const trendSelectors = [
        // ATG-specifika data-test-id attribut
        '[data-test-id*="betting-trends"]',
        '[data-test-id*="trend"]',

        // Data attributes
        '[data-testid*="trend"]',

        // Class-based selectors
        '[class*="trend"]',

        // Generic selectors
        ".trend",
        ".trend-selector",
        '[data-test="trend"]',
        "td:nth-child(6)",
        "td:nth-child(7)",
        "span",
        "div",
      ];

      const oddsSelectors = [
        // ATG-specifika data-test-id attribut
        '[data-test-id*="default-odds"]',
        '[data-test-id*="odds"]',
        '[data-test-id*="price"]',

        // Data attributes
        '[data-testid*="odds"]',
        '[data-testid*="price"]',

        // Class-based selectors
        '[class*="odds"]',
        '[class*="price"]',

        // Generic selectors
        ".odds",
        ".odds-selector",
        ".price",
        '[data-test="odds"]',
        "td:nth-child(7)",
        "td:nth-child(8)",
        "span",
        "div",
      ];

      const shoeSelectors = [
        // ATG-specifika sko-selektorer
        ".horse-fsow8y-ShoeCell-styles--shoeIcon",
        '[class*="ShoeCell"]',
        '[class*="shoeIcon"]',
        '[class*="shoe"]',

        // Data attributes
        '[data-testid*="shoe"]',
        '[data-testid*="skor"]',

        // Class-based selectors
        '[class*="skor"]',

        // Generic selectors
        ".shoe",
        ".shoes",
        ".shoe-col",
        ".shoe-selector",
        '[data-test="shoes"]',
        "td:nth-child(8)",
        "td:nth-child(9)",
        "span",
        "div",
      ];

      // Extrahera data med fallback-selektorer
      const name = await this.extractTextWithFallback(row, nameSelectors);
      const numberText = await this.extractTextWithFallback(
        row,
        numberSelectors
      );
      const driver = await this.extractTextWithFallback(row, driverSelectors);
      const trainer = await this.extractTextWithFallback(row, trainerSelectors);
      const v75Percent = await this.extractTextWithFallback(row, v75Selectors);
      const trend = await this.extractTextWithFallback(row, trendSelectors);
      const odds = await this.extractTextWithFallback(row, oddsSelectors);

      // Extrahera skor
      let shoes;
      for (const selector of shoeSelectors) {
        try {
          const shoeElement = await row.$(selector);
          if (shoeElement) {
            shoes = await extractShoeFromElement(shoeElement);
            if (shoes) break;
          }
        } catch (error) {
          // Ignorera fel och försök nästa selector
        }
      }

      // Validera att vi har minsta nödvändiga data
      if (!name || !driver || !trainer) {
        console.warn(`Häst ${rowIndex} saknar nödvändig data:`, {
          name,
          driver,
          trainer,
        });
        return null;
      }

      // Konvertera nummer
      const number = this.parseHorseNumber(numberText) || rowIndex;

      return {
        name: name.trim(),
        number,
        driver: driver.trim(),
        trainer: trainer.trim(),
        v75Percent: v75Percent?.trim() || undefined,
        trend: trend?.trim() || undefined,
        odds: odds?.trim() || undefined,
        shoes,
      };
    } catch (error) {
      console.warn(
        `Fel vid extrahering av hästdata från rad ${rowIndex}:`,
        error
      );
      return null;
    }
  }

  private async extractTextWithFallback(
    row: any,
    selectors: string[]
  ): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const element = await row.$(selector);
        if (element) {
          const text = await element.innerText();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        // Ignorera fel och försök nästa selector
      }
    }
    return null;
  }

  private parseHorseNumber(text: string | null): number | null {
    if (!text) return null;

    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  private normalizeShoeText(text: string | null): string | null {
    if (!text) return null;

    const normalized = text.toLowerCase().trim();

    // Filtrera bort fel data som inte är sko-information
    if (
      normalized.includes("distans") ||
      normalized.includes("vanlig") ||
      normalized.includes("amerikansk") ||
      normalized.includes("trio") ||
      normalized.includes("boost") ||
      normalized.includes("(") ||
      normalized.includes(")") ||
      normalized.match(/^\d+$/) || // Bara siffror
      normalized.length > 50 // För lång text
    ) {
      return null;
    }

    // Mappning baserat på innehåll
    if (
      normalized.includes("barfota fram") &&
      normalized.includes("skor bak")
    ) {
      return "c̶c";
    }

    if (
      normalized.includes("skor fram") &&
      normalized.includes("barfota bak")
    ) {
      return "cc̶";
    }

    if (
      normalized.includes("barfota runt om") ||
      normalized.includes("barfota överallt")
    ) {
      return "c̶c̶";
    }

    if (
      normalized.includes("skor runt om") ||
      normalized.includes("skor överallt")
    ) {
      return "cc";
    }

    // Fallback: kolla enskilda termer
    if (normalized.includes("barfota") && !normalized.includes("skor")) {
      return "c̶c̶"; // Antag barfota överallt om bara "barfota" nämns
    }

    if (normalized.includes("skor") && !normalized.includes("barfota")) {
      return "cc"; // Antag skor överallt om bara "skor" nämns
    }

    return null; // Returnera null om ingen mappning hittades
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Parse CLI-argument
  const cliArgs: Partial<CliArgs> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "");
    const value = args[i + 1];
    if (key && value) {
      (cliArgs as any)[key] = value;
    }
  }

  // Validera argument
  const validatedArgs = CliArgs.parse(cliArgs);

  console.log("V75 Scraper startar...");
  console.log("Argument:", validatedArgs);

  const scraper = new V75Scraper();
  const markdownWriter = new MarkdownWriter();

  try {
    await scraper.initialize();

    // Skapa backup av befintlig fil
    try {
      markdownWriter.createBackup();
    } catch (error) {
      console.log("Ingen befintlig fil att backa upp");
    }

    // Scrapa data
    const v75Data = await scraper.scrapeV75(
      validatedArgs.date,
      validatedArgs.track,
      validatedArgs.bane
    );

    // Validera data
    const validatedData = V75Data.parse(v75Data);

    // Skriv till Markdown
    markdownWriter.writeV75Data(validatedData);

    console.log("Scraping slutfört!");
    console.log(
      `Totalt ${validatedData.divisions.reduce(
        (sum, div) => sum + div.horses.length,
        0
      )} hästar scrapade`
    );
  } catch (error) {
    console.error("Fel under scraping:", error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

// Kör main-funktionen
main().catch(console.error);
