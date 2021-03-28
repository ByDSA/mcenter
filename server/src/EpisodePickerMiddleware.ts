import { Picker } from "rand-picker";
import { DateType } from "./db/models/date";
import { Episode } from "./db/models/episode";
import { History } from "./db/models/history";
import { Serie } from "./db/models/serie.model";
import { Stream } from "./db/models/stream.model";
import { daysBetween, Month } from "./TimeUtils";

export function filter(picker: Picker<Episode>, serie: Serie, lastEp: Episode | null, stream: Stream): void {
    const newData = picker.data.filter((self: Episode) => {
        for (const func of filterFunctions) {
            if (!func({ picker, self, serie, lastEp, stream })) {
                return false;
            }
        }

        return true;
    });

    for (let i = 0; i < picker.data.length; i++) {
        const e_i = picker.data[i];
        if (!newData.includes(e_i)) {
            picker.remove(e_i);
            i--;
        }
    }

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
    weightTag,
    weightLimiter,
];
const filterFunctions: MiddlewareFilterFunction[] = [
    dependent,
    preventDisabled,
    preventRepeatLast,
    removeWeightLowerOrEqualThan(-90),
    preventRepeatInDays(30),
];

function weightCalculator({ self, stream }: Params): number {
    const daysFromLastTime = getDaysFrom(self, stream.history);

    let reinforcementFactor = 1;
    const weight = self.weight;
    if (weight < -1) {
        reinforcementFactor = 1.0 / (-weight);
    } else if (weight > 1)
        reinforcementFactor = weight;
    else
        reinforcementFactor = 1;

    return reinforcementFactor ** 1.5 * daysFromLastTime;
}

function weightTag({ self, picker, serie }: Params): number {
    let weight = self.weight;

    if (!self.tags)
        return weight;
    const now = new Date();
    for (const t of self.tags) {
        switch (t) {
            case "halloween":
                if (now.getMonth() === Month.OCTOBER && now.getDate() >= 24 || now.getMonth() === Month.NOVEMBER && now.getDate() <= 2)
                    weight *= 1000;
                else
                    weight /= 100;
                break;
            case "navidad":
                if (now.getMonth() === Month.DECEMBER && now.getDate() >= 19 || now.getMonth() === Month.JANUARY && now.getDate() <= 6)
                    weight *= 100;
                else
                    weight /= 1000;
                break;
            case "sanvalentin":
                if (now.getMonth() === Month.FEBRUARY && now.getDate() >= 12 || now.getMonth() === Month.FEBRUARY && now.getDate() <= 14)
                    weight *= 100;
                else
                    weight /= 1000;
                break;
            case "acciondegracias":
                if (now.getMonth() === Month.NOVEMBER && now.getDate() >= 12 || now.getMonth() === Month.NOVEMBER && now.getDate() <= 30)
                    weight *= 100;
                else
                    weight /= 1000;
                break;
        }
    }

    return weight;
}

function weightLimiter({ self, picker }: Params): number {
    const weight = picker.getWeight(self) || 1;
    return Math.min(weight, Number.MAX_SAFE_INTEGER / picker.data.length);
}

function preventRepeatLast({ self, lastEp }: Params) {
    return !lastEp || lastEp.id !== self.id;
}

function dependent({ self, lastEp, serie }: Params) {
    let ret = true;
    switch (serie.id) {
        case "simpsons":
            ret &&= dependency(lastEp, "6x23", self, "7x01");
            break;
        case "fguy":
            ret &&= dependency(lastEp, "6x04", self, "6x05");
            break;
    }

    return ret;
}

function dependency(lastEp: Episode | null, idLast: string, self: Episode, idCurrent: string): boolean {
    return lastEp?.id === idLast && self.id === idCurrent || lastEp?.id !== idLast;
}

function preventDisabled({ self }: Params) {
    const ret = self.disabled === undefined || self.disabled === false;
    return ret;
}

function removeWeightLowerOrEqualThan(num: number) {
    return ({ self, picker }: Params): boolean => {
        return self.weight > num;
    }
}

function preventRepeatInDays(minDays: number) {
    return ({ self, stream }: Params): boolean => {
        const daysFromLastTime = getDaysFrom(self, stream.history);
        return daysFromLastTime >= minDays;
    }
}

export function getDaysFrom(self: Episode, history: History[]): number {
    let days = Number.MAX_SAFE_INTEGER;

    const now = new Date();

    for (const h of history) {
        if (h.episodeId === self.id) {
            let date;
            if (h.date.timestamp)
                date = getDateFromTimestampInSec(+h.date.timestamp);
            else
                date = getDateFromYearMonthDayHistory(h.date);

            const d = daysBetween(date, now);

            if (d < days)
                days = d;
        }
    }

    return days;
}

function getDateFromTimestampInSec(timestamp: number): Date {
    let date = new Date();
    date.setTime(timestamp * 1000);
    return date;
}

function getDateFromYearMonthDayHistory(dateIn: DateType) {
    const year = dateIn.year;
    const month = dateIn.month - 1;
    const day = dateIn.day;
    return new Date(year, month, day);
}