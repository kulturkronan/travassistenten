interface SimpleHorse {
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
interface SimpleRace {
    raceNumber: number;
    title: string;
    distance: string;
    trackType: string;
    horses: SimpleHorse[];
}
interface SimpleV75Data {
    date: string;
    track: string;
    races: SimpleRace[];
}
export declare function scrapeV75Simple(): Promise<SimpleV75Data>;
export { SimpleHorse, SimpleRace, SimpleV75Data };
//# sourceMappingURL=simple-scraper.d.ts.map