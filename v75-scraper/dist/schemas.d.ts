import { z } from "zod";
export declare const ShoeCombination: z.ZodEnum<["cc", "c̶c", "cc̶", "c̶c̶"]>;
export type ShoeCombination = z.infer<typeof ShoeCombination>;
export declare const HorseData: z.ZodObject<{
    name: z.ZodString;
    number: z.ZodNumber;
    driver: z.ZodString;
    trainer: z.ZodString;
    v75Percent: z.ZodOptional<z.ZodString>;
    trend: z.ZodOptional<z.ZodString>;
    odds: z.ZodOptional<z.ZodString>;
    shoes: z.ZodOptional<z.ZodEnum<["cc", "c̶c", "cc̶", "c̶c̶"]>>;
    tipComment: z.ZodOptional<z.ZodString>;
    cart: z.ZodOptional<z.ZodString>;
    recentRaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        track: z.ZodString;
        driver: z.ZodString;
        position: z.ZodString;
        distance: z.ZodString;
        time: z.ZodString;
        shoes: z.ZodString;
        odds: z.ZodString;
        prize: z.ZodString;
        cart: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time: string;
        track: string;
        date: string;
        odds: string;
        driver: string;
        shoes: string;
        cart: string;
        position: string;
        distance: string;
        prize: string;
        comment?: string | undefined;
    }, {
        time: string;
        track: string;
        date: string;
        odds: string;
        driver: string;
        shoes: string;
        cart: string;
        position: string;
        distance: string;
        prize: string;
        comment?: string | undefined;
    }>, "many">>;
    raceComment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    number: number;
    name: string;
    driver: string;
    trainer: string;
    odds?: string | undefined;
    v75Percent?: string | undefined;
    trend?: string | undefined;
    shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
    tipComment?: string | undefined;
    cart?: string | undefined;
    recentRaces?: {
        time: string;
        track: string;
        date: string;
        odds: string;
        driver: string;
        shoes: string;
        cart: string;
        position: string;
        distance: string;
        prize: string;
        comment?: string | undefined;
    }[] | undefined;
    raceComment?: string | undefined;
}, {
    number: number;
    name: string;
    driver: string;
    trainer: string;
    odds?: string | undefined;
    v75Percent?: string | undefined;
    trend?: string | undefined;
    shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
    tipComment?: string | undefined;
    cart?: string | undefined;
    recentRaces?: {
        time: string;
        track: string;
        date: string;
        odds: string;
        driver: string;
        shoes: string;
        cart: string;
        position: string;
        distance: string;
        prize: string;
        comment?: string | undefined;
    }[] | undefined;
    raceComment?: string | undefined;
}>;
export type HorseData = z.infer<typeof HorseData>;
export declare const DivisionData: z.ZodObject<{
    divisionNumber: z.ZodNumber;
    horses: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        number: z.ZodNumber;
        driver: z.ZodString;
        trainer: z.ZodString;
        v75Percent: z.ZodOptional<z.ZodString>;
        trend: z.ZodOptional<z.ZodString>;
        odds: z.ZodOptional<z.ZodString>;
        shoes: z.ZodOptional<z.ZodEnum<["cc", "c̶c", "cc̶", "c̶c̶"]>>;
        tipComment: z.ZodOptional<z.ZodString>;
        cart: z.ZodOptional<z.ZodString>;
        recentRaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            track: z.ZodString;
            driver: z.ZodString;
            position: z.ZodString;
            distance: z.ZodString;
            time: z.ZodString;
            shoes: z.ZodString;
            odds: z.ZodString;
            prize: z.ZodString;
            cart: z.ZodString;
            comment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            time: string;
            track: string;
            date: string;
            odds: string;
            driver: string;
            shoes: string;
            cart: string;
            position: string;
            distance: string;
            prize: string;
            comment?: string | undefined;
        }, {
            time: string;
            track: string;
            date: string;
            odds: string;
            driver: string;
            shoes: string;
            cart: string;
            position: string;
            distance: string;
            prize: string;
            comment?: string | undefined;
        }>, "many">>;
        raceComment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        number: number;
        name: string;
        driver: string;
        trainer: string;
        odds?: string | undefined;
        v75Percent?: string | undefined;
        trend?: string | undefined;
        shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
        tipComment?: string | undefined;
        cart?: string | undefined;
        recentRaces?: {
            time: string;
            track: string;
            date: string;
            odds: string;
            driver: string;
            shoes: string;
            cart: string;
            position: string;
            distance: string;
            prize: string;
            comment?: string | undefined;
        }[] | undefined;
        raceComment?: string | undefined;
    }, {
        number: number;
        name: string;
        driver: string;
        trainer: string;
        odds?: string | undefined;
        v75Percent?: string | undefined;
        trend?: string | undefined;
        shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
        tipComment?: string | undefined;
        cart?: string | undefined;
        recentRaces?: {
            time: string;
            track: string;
            date: string;
            odds: string;
            driver: string;
            shoes: string;
            cart: string;
            position: string;
            distance: string;
            prize: string;
            comment?: string | undefined;
        }[] | undefined;
        raceComment?: string | undefined;
    }>, "many">;
    raceInfo: z.ZodOptional<z.ZodObject<{
        time: z.ZodOptional<z.ZodString>;
        track: z.ZodOptional<z.ZodString>;
        distance: z.ZodOptional<z.ZodString>;
        startType: z.ZodOptional<z.ZodString>;
        raceName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        prizeMoney: z.ZodOptional<z.ZodString>;
        conditions: z.ZodOptional<z.ZodString>;
        comment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        time?: string | undefined;
        track?: string | undefined;
        distance?: string | undefined;
        comment?: string | undefined;
        startType?: string | undefined;
        raceName?: string | undefined;
        description?: string | undefined;
        prizeMoney?: string | undefined;
        conditions?: string | undefined;
    }, {
        time?: string | undefined;
        track?: string | undefined;
        distance?: string | undefined;
        comment?: string | undefined;
        startType?: string | undefined;
        raceName?: string | undefined;
        description?: string | undefined;
        prizeMoney?: string | undefined;
        conditions?: string | undefined;
    }>>;
    speltips: z.ZodOptional<z.ZodObject<{
        rankA: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rankB: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rankC: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        paceAnalysis: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        detailedTips: z.ZodOptional<z.ZodArray<z.ZodObject<{
            horseNumber: z.ZodString;
            horseName: z.ZodString;
            description: z.ZodString;
            tip: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            horseNumber: string;
            horseName: string;
            tip?: string | undefined;
        }, {
            description: string;
            horseNumber: string;
            horseName: string;
            tip?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        source?: string | undefined;
        rankA?: string[] | undefined;
        rankB?: string[] | undefined;
        rankC?: string[] | undefined;
        paceAnalysis?: string | undefined;
        detailedTips?: {
            description: string;
            horseNumber: string;
            horseName: string;
            tip?: string | undefined;
        }[] | undefined;
    }, {
        source?: string | undefined;
        rankA?: string[] | undefined;
        rankB?: string[] | undefined;
        rankC?: string[] | undefined;
        paceAnalysis?: string | undefined;
        detailedTips?: {
            description: string;
            horseNumber: string;
            horseName: string;
            tip?: string | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    divisionNumber: number;
    horses: {
        number: number;
        name: string;
        driver: string;
        trainer: string;
        odds?: string | undefined;
        v75Percent?: string | undefined;
        trend?: string | undefined;
        shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
        tipComment?: string | undefined;
        cart?: string | undefined;
        recentRaces?: {
            time: string;
            track: string;
            date: string;
            odds: string;
            driver: string;
            shoes: string;
            cart: string;
            position: string;
            distance: string;
            prize: string;
            comment?: string | undefined;
        }[] | undefined;
        raceComment?: string | undefined;
    }[];
    raceInfo?: {
        time?: string | undefined;
        track?: string | undefined;
        distance?: string | undefined;
        comment?: string | undefined;
        startType?: string | undefined;
        raceName?: string | undefined;
        description?: string | undefined;
        prizeMoney?: string | undefined;
        conditions?: string | undefined;
    } | undefined;
    speltips?: {
        source?: string | undefined;
        rankA?: string[] | undefined;
        rankB?: string[] | undefined;
        rankC?: string[] | undefined;
        paceAnalysis?: string | undefined;
        detailedTips?: {
            description: string;
            horseNumber: string;
            horseName: string;
            tip?: string | undefined;
        }[] | undefined;
    } | undefined;
}, {
    divisionNumber: number;
    horses: {
        number: number;
        name: string;
        driver: string;
        trainer: string;
        odds?: string | undefined;
        v75Percent?: string | undefined;
        trend?: string | undefined;
        shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
        tipComment?: string | undefined;
        cart?: string | undefined;
        recentRaces?: {
            time: string;
            track: string;
            date: string;
            odds: string;
            driver: string;
            shoes: string;
            cart: string;
            position: string;
            distance: string;
            prize: string;
            comment?: string | undefined;
        }[] | undefined;
        raceComment?: string | undefined;
    }[];
    raceInfo?: {
        time?: string | undefined;
        track?: string | undefined;
        distance?: string | undefined;
        comment?: string | undefined;
        startType?: string | undefined;
        raceName?: string | undefined;
        description?: string | undefined;
        prizeMoney?: string | undefined;
        conditions?: string | undefined;
    } | undefined;
    speltips?: {
        source?: string | undefined;
        rankA?: string[] | undefined;
        rankB?: string[] | undefined;
        rankC?: string[] | undefined;
        paceAnalysis?: string | undefined;
        detailedTips?: {
            description: string;
            horseNumber: string;
            horseName: string;
            tip?: string | undefined;
        }[] | undefined;
    } | undefined;
}>;
export type DivisionData = z.infer<typeof DivisionData>;
export declare const V75Data: z.ZodObject<{
    date: z.ZodString;
    track: z.ZodString;
    divisions: z.ZodArray<z.ZodObject<{
        divisionNumber: z.ZodNumber;
        horses: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            number: z.ZodNumber;
            driver: z.ZodString;
            trainer: z.ZodString;
            v75Percent: z.ZodOptional<z.ZodString>;
            trend: z.ZodOptional<z.ZodString>;
            odds: z.ZodOptional<z.ZodString>;
            shoes: z.ZodOptional<z.ZodEnum<["cc", "c̶c", "cc̶", "c̶c̶"]>>;
            tipComment: z.ZodOptional<z.ZodString>;
            cart: z.ZodOptional<z.ZodString>;
            recentRaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
                date: z.ZodString;
                track: z.ZodString;
                driver: z.ZodString;
                position: z.ZodString;
                distance: z.ZodString;
                time: z.ZodString;
                shoes: z.ZodString;
                odds: z.ZodString;
                prize: z.ZodString;
                cart: z.ZodString;
                comment: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }, {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }>, "many">>;
            raceComment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            number: number;
            name: string;
            driver: string;
            trainer: string;
            odds?: string | undefined;
            v75Percent?: string | undefined;
            trend?: string | undefined;
            shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
            tipComment?: string | undefined;
            cart?: string | undefined;
            recentRaces?: {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }[] | undefined;
            raceComment?: string | undefined;
        }, {
            number: number;
            name: string;
            driver: string;
            trainer: string;
            odds?: string | undefined;
            v75Percent?: string | undefined;
            trend?: string | undefined;
            shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
            tipComment?: string | undefined;
            cart?: string | undefined;
            recentRaces?: {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }[] | undefined;
            raceComment?: string | undefined;
        }>, "many">;
        raceInfo: z.ZodOptional<z.ZodObject<{
            time: z.ZodOptional<z.ZodString>;
            track: z.ZodOptional<z.ZodString>;
            distance: z.ZodOptional<z.ZodString>;
            startType: z.ZodOptional<z.ZodString>;
            raceName: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            prizeMoney: z.ZodOptional<z.ZodString>;
            conditions: z.ZodOptional<z.ZodString>;
            comment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            time?: string | undefined;
            track?: string | undefined;
            distance?: string | undefined;
            comment?: string | undefined;
            startType?: string | undefined;
            raceName?: string | undefined;
            description?: string | undefined;
            prizeMoney?: string | undefined;
            conditions?: string | undefined;
        }, {
            time?: string | undefined;
            track?: string | undefined;
            distance?: string | undefined;
            comment?: string | undefined;
            startType?: string | undefined;
            raceName?: string | undefined;
            description?: string | undefined;
            prizeMoney?: string | undefined;
            conditions?: string | undefined;
        }>>;
        speltips: z.ZodOptional<z.ZodObject<{
            rankA: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rankB: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rankC: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            paceAnalysis: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            detailedTips: z.ZodOptional<z.ZodArray<z.ZodObject<{
                horseNumber: z.ZodString;
                horseName: z.ZodString;
                description: z.ZodString;
                tip: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }, {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            source?: string | undefined;
            rankA?: string[] | undefined;
            rankB?: string[] | undefined;
            rankC?: string[] | undefined;
            paceAnalysis?: string | undefined;
            detailedTips?: {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }[] | undefined;
        }, {
            source?: string | undefined;
            rankA?: string[] | undefined;
            rankB?: string[] | undefined;
            rankC?: string[] | undefined;
            paceAnalysis?: string | undefined;
            detailedTips?: {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        divisionNumber: number;
        horses: {
            number: number;
            name: string;
            driver: string;
            trainer: string;
            odds?: string | undefined;
            v75Percent?: string | undefined;
            trend?: string | undefined;
            shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
            tipComment?: string | undefined;
            cart?: string | undefined;
            recentRaces?: {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }[] | undefined;
            raceComment?: string | undefined;
        }[];
        raceInfo?: {
            time?: string | undefined;
            track?: string | undefined;
            distance?: string | undefined;
            comment?: string | undefined;
            startType?: string | undefined;
            raceName?: string | undefined;
            description?: string | undefined;
            prizeMoney?: string | undefined;
            conditions?: string | undefined;
        } | undefined;
        speltips?: {
            source?: string | undefined;
            rankA?: string[] | undefined;
            rankB?: string[] | undefined;
            rankC?: string[] | undefined;
            paceAnalysis?: string | undefined;
            detailedTips?: {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }[] | undefined;
        } | undefined;
    }, {
        divisionNumber: number;
        horses: {
            number: number;
            name: string;
            driver: string;
            trainer: string;
            odds?: string | undefined;
            v75Percent?: string | undefined;
            trend?: string | undefined;
            shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
            tipComment?: string | undefined;
            cart?: string | undefined;
            recentRaces?: {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }[] | undefined;
            raceComment?: string | undefined;
        }[];
        raceInfo?: {
            time?: string | undefined;
            track?: string | undefined;
            distance?: string | undefined;
            comment?: string | undefined;
            startType?: string | undefined;
            raceName?: string | undefined;
            description?: string | undefined;
            prizeMoney?: string | undefined;
            conditions?: string | undefined;
        } | undefined;
        speltips?: {
            source?: string | undefined;
            rankA?: string[] | undefined;
            rankB?: string[] | undefined;
            rankC?: string[] | undefined;
            paceAnalysis?: string | undefined;
            detailedTips?: {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }[] | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    track: string;
    date: string;
    divisions: {
        divisionNumber: number;
        horses: {
            number: number;
            name: string;
            driver: string;
            trainer: string;
            odds?: string | undefined;
            v75Percent?: string | undefined;
            trend?: string | undefined;
            shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
            tipComment?: string | undefined;
            cart?: string | undefined;
            recentRaces?: {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }[] | undefined;
            raceComment?: string | undefined;
        }[];
        raceInfo?: {
            time?: string | undefined;
            track?: string | undefined;
            distance?: string | undefined;
            comment?: string | undefined;
            startType?: string | undefined;
            raceName?: string | undefined;
            description?: string | undefined;
            prizeMoney?: string | undefined;
            conditions?: string | undefined;
        } | undefined;
        speltips?: {
            source?: string | undefined;
            rankA?: string[] | undefined;
            rankB?: string[] | undefined;
            rankC?: string[] | undefined;
            paceAnalysis?: string | undefined;
            detailedTips?: {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }[] | undefined;
        } | undefined;
    }[];
}, {
    track: string;
    date: string;
    divisions: {
        divisionNumber: number;
        horses: {
            number: number;
            name: string;
            driver: string;
            trainer: string;
            odds?: string | undefined;
            v75Percent?: string | undefined;
            trend?: string | undefined;
            shoes?: "cc" | "c̶c" | "cc̶" | "c̶c̶" | undefined;
            tipComment?: string | undefined;
            cart?: string | undefined;
            recentRaces?: {
                time: string;
                track: string;
                date: string;
                odds: string;
                driver: string;
                shoes: string;
                cart: string;
                position: string;
                distance: string;
                prize: string;
                comment?: string | undefined;
            }[] | undefined;
            raceComment?: string | undefined;
        }[];
        raceInfo?: {
            time?: string | undefined;
            track?: string | undefined;
            distance?: string | undefined;
            comment?: string | undefined;
            startType?: string | undefined;
            raceName?: string | undefined;
            description?: string | undefined;
            prizeMoney?: string | undefined;
            conditions?: string | undefined;
        } | undefined;
        speltips?: {
            source?: string | undefined;
            rankA?: string[] | undefined;
            rankB?: string[] | undefined;
            rankC?: string[] | undefined;
            paceAnalysis?: string | undefined;
            detailedTips?: {
                description: string;
                horseNumber: string;
                horseName: string;
                tip?: string | undefined;
            }[] | undefined;
        } | undefined;
    }[];
}>;
export type V75Data = z.infer<typeof V75Data>;
export declare const CliArgs: z.ZodObject<{
    date: z.ZodString;
    track: z.ZodString;
    bane: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    track: string;
    date: string;
    bane?: string | undefined;
}, {
    track: string;
    date: string;
    bane?: string | undefined;
}>;
export type CliArgs = z.infer<typeof CliArgs>;
export declare const ExcelColumnMapping: {
    readonly HORSE_NAME: "A";
    readonly HORSE_NUMBER: "B";
    readonly DRIVER: "C";
    readonly TRAINER: "D";
    readonly V75_PERCENT: "E";
    readonly TREND: "F";
    readonly ODDS: "G";
    readonly SHOES: "H";
};
//# sourceMappingURL=schemas.d.ts.map