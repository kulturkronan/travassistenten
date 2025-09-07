import { V75Data } from "./schemas.js";
export declare class ExcelWriter {
    private workbook;
    private templatePath;
    constructor(templatePath?: string);
    private loadOrCreateWorkbook;
    /**
     * Skriver V75-data till Excel-fil
     */
    writeV75Data(data: V75Data): void;
    private createDivisionSheet;
    private clearSheetData;
    private writeHorsesToSheet;
    private saveWorkbook;
    /**
     * Skapar en backup av befintlig fil
     */
    createBackup(): string;
}
//# sourceMappingURL=excelWriter.d.ts.map