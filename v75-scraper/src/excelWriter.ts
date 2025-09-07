import * as XLSX from "xlsx";
import { V75Data, HorseData, ExcelColumnMapping } from "./schemas.js";
import path from "path";

export class ExcelWriter {
  private workbook: XLSX.WorkBook;
  private templatePath: string;

  constructor(templatePath: string = "V75_UtokadStartlista_Mall.xlsx") {
    this.templatePath = templatePath;
    this.workbook = this.loadOrCreateWorkbook();
  }

  private loadOrCreateWorkbook(): XLSX.WorkBook {
    try {
      // Försök ladda befintlig mall
      return XLSX.readFile(this.templatePath);
    } catch (error) {
      console.log("Skapar ny Excel-mall...");
      // Skapa ny arbetsbok med 7 flikar (Avd1-Avd7)
      const workbook = XLSX.utils.book_new();

      for (let i = 1; i <= 7; i++) {
        const worksheet = XLSX.utils.aoa_to_sheet([
          // Header-rad
          [
            "Hästnamn",
            "Nr",
            "Kusk",
            "Tränare",
            "V75%",
            "Trend",
            "Odds",
            "Skor",
          ],
        ]);

        // Sätt kolumnbredder
        worksheet["!cols"] = [
          { wch: 20 }, // Hästnamn
          { wch: 5 }, // Nr
          { wch: 15 }, // Kusk
          { wch: 15 }, // Tränare
          { wch: 8 }, // V75%
          { wch: 8 }, // Trend
          { wch: 8 }, // Odds
          { wch: 8 }, // Skor
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, `Avd${i}`);
      }

      return workbook;
    }
  }

  /**
   * Skriver V75-data till Excel-fil
   */
  public writeV75Data(data: V75Data): void {
    for (const division of data.divisions) {
      const sheetName = `Avd${division.divisionNumber}`;
      const worksheet = this.workbook.Sheets[sheetName];

      if (!worksheet) {
        console.warn(`Flik ${sheetName} hittades inte, skapar ny...`);
        this.createDivisionSheet(division.divisionNumber);
        continue;
      }

      // Rensa befintlig data (behåll header)
      this.clearSheetData(worksheet);

      // Skriv hästdata
      this.writeHorsesToSheet(worksheet, division.horses);
    }

    // Spara filen
    this.saveWorkbook();
  }

  private createDivisionSheet(divisionNumber: number): void {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Hästnamn", "Nr", "Kusk", "Tränare", "V75%", "Trend", "Odds", "Skor"],
    ]);

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 5 },
      { wch: 15 },
      { wch: 15 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
    ];

    XLSX.utils.book_append_sheet(
      this.workbook,
      worksheet,
      `Avd${divisionNumber}`
    );
  }

  private clearSheetData(worksheet: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:H1");

    // Behåll header-rad (rad 1), rensa resten
    for (let row = 2; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        delete worksheet[cellAddress];
      }
    }

    // Uppdatera range
    worksheet["!ref"] = "A1:H1";
  }

  private writeHorsesToSheet(
    worksheet: XLSX.WorkSheet,
    horses: HorseData[]
  ): void {
    let currentRow = 2; // Börja på rad 2 (efter header)

    for (const horse of horses) {
      const rowData = [
        horse.name,
        horse.number,
        horse.driver,
        horse.trainer,
        horse.v75Percent || "",
        horse.trend || "",
        horse.odds || "",
        horse.shoes || "",
      ];

      // Skriv rad till worksheet
      for (let col = 0; col < rowData.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: currentRow - 1,
          c: col,
        });
        worksheet[cellAddress] = { v: rowData[col] };
      }

      currentRow++;
    }

    // Uppdatera range
    const newRange = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: currentRow - 2, c: 7 },
    });
    worksheet["!ref"] = newRange;
  }

  private saveWorkbook(): void {
    try {
      XLSX.writeFile(this.workbook, this.templatePath);
      console.log(`Excel-fil sparad: ${this.templatePath}`);
    } catch (error) {
      console.error("Fel vid sparande av Excel-fil:", error);
      throw error;
    }
  }

  /**
   * Skapar en backup av befintlig fil
   */
  public createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = this.templatePath.replace(
      ".xlsx",
      `_backup_${timestamp}.xlsx`
    );

    try {
      XLSX.writeFile(this.workbook, backupPath);
      console.log(`Backup skapad: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error("Fel vid skapande av backup:", error);
      throw error;
    }
  }
}
