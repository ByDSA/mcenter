import { Episode } from "./db/models/episode";
import { History } from "./db/models/history";
import { Serie } from "./db/models/serie.model";
import { Stream } from "./db/models/stream.model";
import { WeightWrapper, wrap } from "./randompicker/pickers/WeightPicker";
import { daysBetween } from "./Utils";

export function filter(weightEpisodes: WeightWrapper<Episode>[], serie: Serie, lastEp: Episode | null, stream: Stream): WeightWrapper<Episode>[] {
    const ret = weightEpisodes.filter(self => {
        for (const func of filterFunctions) {
            if (!func({ self, array: weightEpisodes, serie, lastEp, stream }))
                return false;
        }

        return true;
    });

    if (ret.length === 0)
        return [wrap(serie.episodes[0])];

    return ret;
}

export function fixWeight(weightEpisodes: WeightWrapper<Episode>[], serie: Serie, lastEp: Episode | null, stream: Stream): void {
    for (const func of middlewareWeightFunctions)
        weightEpisodes = weightEpisodes.map(self => {
            const newWeight = func({ self, array: weightEpisodes, serie, lastEp, stream });
            self.weight = newWeight;
            return self
        });
}

type Params = { self: WeightWrapper<Episode>, array: WeightWrapper<Episode>[], serie: Serie, lastEp: Episode | null, stream: Stream };
type MiddlewareWeightFunction = (params: Params) => number;
type MiddlewareFilterFunction = (params: Params) => boolean;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
    weightCalculator,
    weightLimiter
];
const filterFunctions: MiddlewareFilterFunction[] = [
    preventRepeatLast,
    preventRepeatInDays(30),
    removeWeightLowerOrEqualThan(-90)
];

function weightCalculator({ self, stream }: Params): number {
    const daysFromLastTime = getDaysFrom(self.get(), stream.history);

    let reinforcementFactor = 1;
    const weight = self.get().weight;
    if (weight < -1) {
        reinforcementFactor = 1.0 / (-weight);
    } else if (weight > 1)
        reinforcementFactor = weight;

    return reinforcementFactor * daysFromLastTime;
}

function weightLimiter({ self, array }: Params): number {
    return Math.min(self.weight, Number.MAX_SAFE_INTEGER / array.length);
}

function preventRepeatLast({ self, lastEp }: Params) {
    return !lastEp || lastEp.id !== self.get().id;
}

function removeWeightLowerOrEqualThan(num: number) {
    return ({ self }: Params): boolean => {
        return self.get().weight > num;
    }
}

function preventRepeatInDays(minDays: number) {
    return ({ self, stream }: Params): boolean => {
        const daysFromLastTime = getDaysFrom(self.get(), stream.history);
        return daysFromLastTime >= minDays;
    }
}

function getDaysFrom(self: Episode, history: History[]): number {
    let days = Number.MAX_SAFE_INTEGER;

    const now = new Date();

    for (const h of history) {
        if (h.episodeId === self.id) {
            const year = h.date.year;
            const month = h.date.month;
            const day = h.date.day;
            const date = new Date(year, month, day);

            const d = daysBetween(date, now);

            if (d < days)
                days = d;
        }
    }

    return days;
}