import { V75Data } from "./schemas.js";
export declare class MarkdownWriter {
    private outputPath;
    constructor(outputPath?: string);
    /**
     * Skriver V75-data till Markdown-fil
     */
    writeV75Data(data: V75Data): void;
    private generateMarkdown;
    private generateDivisionMarkdown;
    private generateHorseDetailsMarkdown;
    private generateSpeltipsMarkdown;
    /**
     * Skapar en backup av befintlig fil
     */
    createBackup(): string;
}
//# sourceMappingURL=markdownWriter.d.ts.map