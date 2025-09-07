import fs from "fs";
export class MarkdownWriter {
    outputPath;
    constructor(outputPath = "V75_Startlista.md") {
        this.outputPath = outputPath;
    }
    /**
     * Skriver V75-data till Markdown-fil
     */
    writeV75Data(data) {
        let markdown = this.generateMarkdown(data);
        try {
            fs.writeFileSync(this.outputPath, markdown, "utf8");
            console.log(`Markdown-fil sparad: ${this.outputPath}`);
        }
        catch (error) {
            console.error("Fel vid sparande av Markdown-fil:", error);
            throw error;
        }
    }
    generateMarkdown(data) {
        let markdown = `# V75 Startlista - ${data.date}\n\n`;
        markdown += `**Bana:** ${data.track}\n\n`;
        markdown += `**Datum:** ${data.date}\n\n`;
        markdown += `---\n\n`;
        for (const division of data.divisions) {
            markdown += this.generateDivisionMarkdown(division);
        }
        return markdown;
    }
    generateDivisionMarkdown(division) {
        let markdown = `## Avdelning ${division.divisionNumber}\n\n`;
        // Lägg till loppinformation här om tillgänglig
        markdown += `### Loppinformation\n`;
        markdown += `*Loppinformation kommer att läggas till här*\n\n`;
        if (division.horses.length === 0) {
            markdown += `*Inga hästar hittades för denna avdelning*\n\n`;
            return markdown;
        }
        markdown += `### Startlista\n\n`;
        markdown += `| Nr | Hästnamn | Kusk | Tränare | V75% | Trend | Odds | Skor |\n`;
        markdown += `|----|----------|------|---------|------|-------|------|------|\n`;
        for (const horse of division.horses) {
            markdown += `| ${horse.number} | ${horse.name} | ${horse.driver} | ${horse.trainer} | ${horse.v75Percent || "N/A"} | ${horse.trend || "N/A"} | ${horse.odds || "N/A"} | ${horse.shoes || "N/A"} |\n`;
        }
        markdown += `\n`;
        // Lägg till speltips om tillgänglig
        if (division.speltips) {
            markdown += this.generateSpeltipsMarkdown(division.speltips);
        }
        // Lägg till detaljerad information för varje häst
        markdown += `### Detaljerad information\n\n`;
        for (const horse of division.horses) {
            markdown += this.generateHorseDetailsMarkdown(horse);
        }
        markdown += `---\n\n`;
        return markdown;
    }
    generateHorseDetailsMarkdown(horse) {
        let markdown = `#### ${horse.number}. ${horse.name}\n\n`;
        markdown += `- **Kusk:** ${horse.driver}\n`;
        markdown += `- **Tränare:** ${horse.trainer}\n`;
        markdown += `- **V75%:** ${horse.v75Percent || "N/A"}\n`;
        markdown += `- **Trend:** ${horse.trend || "N/A"}\n`;
        markdown += `- **Odds:** ${horse.odds || "N/A"}\n`;
        markdown += `- **Skor:** ${horse.shoes || "N/A"}\n\n`;
        // Här kan vi lägga till mer detaljerad information som:
        // - Senaste 5 starter
        // - Tipskommentar
        // - Vagn
        // - Loppkommentar
        // etc.
        return markdown;
    }
    generateSpeltipsMarkdown(speltips) {
        let markdown = `### Speltips\n\n`;
        // Rank-kategorier
        if (speltips.rankA && speltips.rankA.length > 0) {
            markdown += `**Rank A:** ${speltips.rankA.join(", ")}\n\n`;
        }
        if (speltips.rankB && speltips.rankB.length > 0) {
            markdown += `**Rank B:** ${speltips.rankB.join(", ")}\n\n`;
        }
        if (speltips.rankC && speltips.rankC.length > 0) {
            markdown += `**Rank C:** ${speltips.rankC.join(", ")}\n\n`;
        }
        // Spetsanalys
        if (speltips.paceAnalysis) {
            markdown += `**Spetsanalys:** ${speltips.paceAnalysis}\n\n`;
        }
        // Detaljerade tips
        if (speltips.detailedTips && speltips.detailedTips.length > 0) {
            markdown += `**Detaljerade tips:**\n\n`;
            for (const tip of speltips.detailedTips) {
                markdown += `- **${tip.horseNumber} ${tip.horseName}:** ${tip.description}\n`;
                if (tip.tip) {
                    markdown += `  - *${tip.tip}*\n`;
                }
            }
            markdown += `\n`;
        }
        // Källa
        if (speltips.source) {
            markdown += `*Källa: ${speltips.source}*\n\n`;
        }
        return markdown;
    }
    /**
     * Skapar en backup av befintlig fil
     */
    createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = this.outputPath.replace(".md", `_backup_${timestamp}.md`);
        try {
            if (fs.existsSync(this.outputPath)) {
                fs.copyFileSync(this.outputPath, backupPath);
                console.log(`Backup skapad: ${backupPath}`);
            }
            return backupPath;
        }
        catch (error) {
            console.error("Fel vid skapande av backup:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=markdownWriter.js.map