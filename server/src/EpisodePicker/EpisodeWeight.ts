import { Picker } from "rand-picker";
import { Episode } from "../db/models/episode";
import { Serie } from "../db/models/serie.model";
import { Stream } from "../db/models/stream.model";
import { Month } from "../TimeUtils";
import { getDaysFrom } from "./EpisodeFilter";
import { Params } from "./EpisodePicker";

export function fixWeight(picker: Picker<Episode>, serie: Serie, lastEp: Episode | null, stream: Stream): void {
    for (const func of middlewareWeightFunctions)
        picker.data.forEach((self: Episode) => {
            const newWeight = func({ self, picker, serie, lastEp, stream });
            picker.put(self, newWeight);
        });
}

type MiddlewareWeightFunction = (params: Params) => number;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
    weightCalculator,
    weightTag,
    weightLimiter,
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