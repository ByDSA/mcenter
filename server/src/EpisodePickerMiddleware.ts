import { Picker } from "rand-picker";
import { Episode } from "./db/models/episode";
import { History } from "./db/models/history";
import { Serie } from "./db/models/serie.model";
import { Stream } from "./db/models/stream.model";
import { daysBetween } from "./TimeUtils";

export function filter(picker: Picker<Episode>, serie: Serie, lastEp: Episode | null, stream: Stream): void {
    picker.data = picker.data.filter((self: Episode) => {
        for (const func of filterFunctions) {
            if (!func({ picker, self, serie, lastEp, stream })) {
                return false;
            }
        }

        return true;
    });

    if (picker.data.length === 0)
        picker.put(serie.episodes[0]);
}

export function fixWeight(picker: Picker<Episode>, serie: Serie, lastEp: Episode | null, stream: Stream): void {
    for (const func of middlewareWeightFunctions)
        picker.data.forEach((self: Episode) => {
            const newWeight = func({ self, picker, serie, lastEp, stream });
            picker.put(self, newWeight);
        });
}

type Params = { picker: Picker<Episode>, self: Episode, serie: Serie, lastEp: Episode | null, stream: Stream };
type MiddlewareWeightFunction = (params: Params) => number;
type MiddlewareFilterFunction = (params: Params) => boolean;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
    weightCalculator,
    weightLimiter
];
const filterFunctions: MiddlewareFilterFunction[] = [
    preventDisabled,
    preventRepeatLast,
    preventRepeatInDays(30),
    removeWeightLowerOrEqualThan(-90),
];

function weightCalculator({ self, picker, stream }: Params): number {
    const daysFromLastTime = getDaysFrom(self, picker, stream.history);

    let reinforcementFactor = 1;
    const weight = self.weight;
    if (weight < -1) {
        reinforcementFactor = 1.0 / (-weight);
    } else if (weight > 1)
        reinforcementFactor = weight;
    else
        reinforcementFactor = 1;

    return reinforcementFactor * daysFromLastTime;
}

function weightLimiter({ self, picker }: Params): number {
    const weight = picker.getWeight(self) || 1;
    return Math.min(weight, Number.MAX_SAFE_INTEGER / picker.data.length);
}

function preventRepeatLast({ self, lastEp }: Params) {
    return !lastEp || lastEp.id !== self.id;
}

function preventDisabled({ self }: Params) {
    const ret = self.disabled === undefined || self.disabled === false;
    console.log(self.id + " " + ret);
    return ret;
}

function removeWeightLowerOrEqualThan(num: number) {
    return ({ self, picker }: Params): boolean => {
        return self.weight > num;
    }
}

function preventRepeatInDays(minDays: number) {
    return ({ self, picker, stream }: Params): boolean => {
        const daysFromLastTime = getDaysFrom(self, picker, stream.history);
        return daysFromLastTime >= minDays;
    }
}

function getDaysFrom(self: Episode, picker: Picker<Episode>, history: History[]): number {
    let days = Number.MAX_SAFE_INTEGER;

    const now = new Date();

    for (const h of history) {
        if (h.episodeId === self.id) {
            let date;
            if (h.date.timestamp)
                date = new Date(+h.date.timestamp);
            else {
                const year = h.date.year;
                const month = h.date.month + 1;
                const day = h.date.day;
                date = new Date(year, month, day);
            }

            const d = daysBetween(date, now);

            if (d < days)
                days = d;
        }
    }

    return days;
}