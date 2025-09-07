import { ExcelWriter } from "./excelWriter.js";

// Skapa Excel-mall
const writer = new ExcelWriter("V75_UtokadStartlista_Mall.xlsx");

// Skapa en tom mall med korrekt struktur
const emptyData = {
  date: "2025-01-01",
  track: "template",
  divisions: Array.from({ length: 7 }, (_, i) => ({
    divisionNumber: i + 1,
    horses: [],
  })),
};

writer.writeV75Data(emptyData);
console.log("Excel-mall skapad: V75_UtokadStartlista_Mall.xlsx");
