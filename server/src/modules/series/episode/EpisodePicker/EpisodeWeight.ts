/* eslint-disable require-await */
import HistoryList from "#modules/history/model/HistoryList";
import { SerieWithEpisodes } from "#modules/series";
import { StreamWithHistoryList } from "#modules/streamWithHistoryList";
import { daysBetween } from "date-ops";
import { DateTime } from "luxon";
import { Picker } from "rand-picker";
import { dynamicLoadScriptFromEnvVar } from "../../../../DynamicLoad";
import { getDaysFromLastPlayed } from "../lastPlayed";
import { Episode } from "../model";
import { Params } from "./utils";

type MiddlewareWeightFunction = (params: Params<Episode>)=> Promise<number>;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
  weightCalculator,
  weightTag,
  weightLimiter,
];

export default async function fixWeight(
  picker: Picker<Episode>,
  serie: SerieWithEpisodes,
  lastEp: Episode | null,
  stream: StreamWithHistoryList,
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
        lastEp,
        stream,
        historyList,
      } );

      picker.put(self, newWeight);
    }
  }

  console.log("Fixed weight!");
}

async function weightCalculator( { self, historyList }: Params<Episode>): Promise<number> {
  const daysFromLastTime = self.lastTimePlayed
    ? daysBetween(DateTime.now(), DateTime.fromSeconds(self.lastTimePlayed))
    : getDaysFromLastPlayed(self, historyList);
  let reinforcementFactor = 1;
  const weight = self && self.weight ? self.weight : 0;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
}

async function weightTag( { self, picker }: Params<Episode>): Promise<number> {
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

async function weightLimiter( { self, picker }: Params<Episode>): Promise<number> {
  const weight = picker.getWeight(self) || 1;

  return Math.min(weight, Number.MAX_SAFE_INTEGER / picker.data.length);
}
