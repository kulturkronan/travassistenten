interface V75Horse {
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
interface V75Race {
    raceNumber: number;
    title: string;
    distance: string;
    trackType: string;
    horses: V75Horse[];
}
interface V75Data {
    date: string;
    track: string;
    races: V75Race[];
}
export declare function scrapeV75WithCookies(cookies: string, userAgent: string): Promise<V75Data>;
export { V75Horse, V75Race, V75Data };
//# sourceMappingURL=v75-with-cookies.d.ts.map