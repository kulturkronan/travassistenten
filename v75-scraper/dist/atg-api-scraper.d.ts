interface ATGHorse {
    number: number;
    name: string;
    driver: string;
    track: number;
    record: string;
    prizeMoney: number;
    v75Percent: number;
    trendPercent?: number;
    vOdds: number;
    pOdds: number;
    shoes: string;
    wagon: string;
    scratched: boolean;
    tips?: string;
}
interface ATGRace {
    raceNumber: number;
    title: string;
    distance: string;
    trackType: string;
    horses: ATGHorse[];
}
interface ATGV75Data {
    date: string;
    track: string;
    races: ATGRace[];
}
export declare function scrapeATGAPI(): Promise<ATGV75Data>;
export { ATGHorse, ATGRace, ATGV75Data };
//# sourceMappingURL=atg-api-scraper.d.ts.map