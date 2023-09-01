/* eslint-disable require-await */
import { HistoryList } from "#modules/historyLists";
import { Serie } from "#modules/series";
import { Stream } from "#modules/streams";
import { daysBetween } from "date-ops";
import { DateTime } from "luxon";
import { Picker } from "rand-picker";
import { dynamicLoadScriptFromEnvVar } from "../../../DynamicLoad";
import LastTimePlayed from "../LastTimePlayedService";
import { Model } from "../models";
import { Params } from "./utils";

type MiddlewareWeightFunction = (params: Params<Model>)=> Promise<number>;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
  weightCalculator,
  weightTag,
  weightLimiter,
];

export default async function fixWeight(
  picker: Picker<Model>,
  serie: Serie,
  episodes: Model[],
  lastEp: Model | null,
  stream: Stream,
  historyList: HistoryList,
): Promise<void> {
  console.log("Fixing weight...");

  for (const self of picker.data) {
    for (const func of middlewareWeightFunctions) {
      // eslint-disable-next-line no-await-in-loop
      const newWeight = await func( {
        self,
        picker,
        serie,
        episodes,
        lastEp,
        stream,
        historyList,
      } );

      picker.put(self, newWeight);
    }
  }

  console.log("Fixed weight!");
}

async function weightCalculator( { self, historyList }: Params<Model>): Promise<number> {
  const lastTimePlayedService = new LastTimePlayed();
  const daysFromLastTime = self.lastTimePlayed
    ? daysBetween(DateTime.now(), DateTime.fromSeconds(self.lastTimePlayed))
    : lastTimePlayedService.getDaysFromLastPlayed(self, historyList);
  let reinforcementFactor = 1;
  const weight = self && self.weight ? self.weight : 0;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
}

async function weightTag( { self, picker }: Params<Model>): Promise<number> {
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

async function weightLimiter( { self, picker }: Params<Model>): Promise<number> {
  const weight = picker.getWeight(self) || 1;

  return Math.min(weight, Number.MAX_SAFE_INTEGER / picker.data.length);
}
