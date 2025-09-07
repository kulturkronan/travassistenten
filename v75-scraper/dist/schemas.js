import { z } from "zod";
// Skor-kombinationer som mappas från ATG-text
export const ShoeCombination = z.enum(["cc", "c̶c", "cc̶", "c̶c̶"]);
// Hästdata från startlistan
export const HorseData = z.object({
    name: z.string().min(1, "Hästnamn krävs"),
    number: z.number().int().positive("Hästnummer måste vara positivt"),
    driver: z.string().min(1, "Kusk krävs"),
    trainer: z.string().min(1, "Tränare krävs"),
    v75Percent: z.string().optional(), // Kan vara tom eller "N/A"
    trend: z.string().optional(), // Kan vara tom eller "N/A"
    odds: z.string().optional(), // Kan vara tom eller "N/A"
    shoes: ShoeCombination.optional(), // Kan vara undefined om inte hittat
    tipComment: z.string().optional(), // Tipskommentar
    cart: z.string().optional(), // Vagn
    recentRaces: z
        .array(z.object({
        date: z.string(),
        track: z.string(),
        driver: z.string(),
        position: z.string(),
        distance: z.string(),
        time: z.string(),
        shoes: z.string(),
        odds: z.string(),
        prize: z.string(),
        cart: z.string(),
        comment: z.string().optional(),
    }))
        .optional(), // Senaste 5 starter
    raceComment: z.string().optional(), // Loppkommentar
});
// Avdelningsdata
export const DivisionData = z.object({
    divisionNumber: z.number().int().min(1).max(7),
    horses: z.array(HorseData),
    raceInfo: z
        .object({
        time: z.string().optional(), // Starttid
        track: z.string().optional(), // Bana
        distance: z.string().optional(), // Distans
        startType: z.string().optional(), // Voltstart, etc.
        raceName: z.string().optional(), // Loppnamn
        description: z.string().optional(), // Beskrivning
        prizeMoney: z.string().optional(), // Prispengar
        conditions: z.string().optional(), // Villkor
        comment: z.string().optional(), // Loppkommentar
    })
        .optional(),
    speltips: z
        .object({
        rankA: z.array(z.string()).optional(), // Rank A hästar
        rankB: z.array(z.string()).optional(), // Rank B hästar
        rankC: z.array(z.string()).optional(), // Rank C hästar
        paceAnalysis: z.string().optional(), // Spetsanalys
        source: z.string().optional(), // Källa (t.ex. "TR Media")
        detailedTips: z
            .array(z.object({
            horseNumber: z.string(),
            horseName: z.string(),
            description: z.string(),
            tip: z.string().optional(),
        }))
            .optional(), // Detaljerade tips per häst
    })
        .optional(),
});
// Komplett V75-data
export const V75Data = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum måste vara i format YYYY-MM-DD"),
    track: z.string().min(1, "Bana krävs"),
    divisions: z.array(DivisionData).length(7, "Måste ha exakt 7 avdelningar"),
});
// CLI-argument
export const CliArgs = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum måste vara i format YYYY-MM-DD"),
    track: z.string().min(1, "Bana krävs"),
    bane: z.string().optional(), // Optional bane parameter
});
// Excel-kolumnmappning
export const ExcelColumnMapping = {
    HORSE_NAME: "A",
    HORSE_NUMBER: "B",
    DRIVER: "C",
    TRAINER: "D",
    V75_PERCENT: "E",
    TREND: "F",
    ODDS: "G",
    SHOES: "H",
};
//# sourceMappingURL=schemas.js.map