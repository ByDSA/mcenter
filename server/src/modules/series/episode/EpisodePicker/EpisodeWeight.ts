/* eslint-disable require-await */
import { Picker } from "rand-picker";
import { Serie } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { dynamicLoadScriptFromEnvVar } from "../../../../DynamicLoad";
import { Episode } from "../model";
import { getDaysFromLastInHistory } from "./EpisodeFilter";
import { Params } from "./utils";

type MiddlewareWeightFunction = (params: Params)=> Promise<number>;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
  weightCalculator,
  weightTag,
  weightLimiter,
];

export default async function fixWeight(
  picker: Picker<Episode>,
  serie: Serie,
  lastEp: Episode | null,
  stream: Stream,
): Promise<void> {
  console.log("Fixing weight...");

  for (const self of picker.data) {
    for (const func of middlewareWeightFunctions) {
      // eslint-disable-next-line no-await-in-loop
      const newWeight = await func( {
        self,
        picker,
        serie,
        lastEp,
        stream,
      } );

      picker.put(self, newWeight);
    }
  }
}

async function weightCalculator( { self, stream }: Params): Promise<number> {
  const daysFromLastTime = getDaysFromLastInHistory(self, stream.history);
  let reinforcementFactor = 1;
  const weight = self && self.weight ? self.weight : 0;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
}

async function weightTag( { self, picker }: Params): Promise<number> {
  let weight = picker.getWeight(self) ?? 0;

  if (self && !self.tags)
    return weight;

  const tags = self?.tags || [];
  const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE");
  const calendar = calendarFunc();
  const tagFuncPromise = dynamicLoadScriptFromEnvVar("TAG_FILE");

  return tagFuncPromise.then((f) => {
    for (const t of tags)
      weight *= f(t, calendar);

    return weight;
  } );
}

async function weightLimiter( { self, picker }: Params): Promise<number> {
  const weight = picker.getWeight(self) || 1;

  return Math.min(weight, Number.MAX_SAFE_INTEGER / picker.data.length);
}
