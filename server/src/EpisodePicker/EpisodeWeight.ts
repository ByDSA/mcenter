/* eslint-disable require-await */
import { Picker } from "rand-picker";
import { Episode } from "../db/models/episode";
import { Serie } from "../db/models/serie.model";
import { Stream } from "../db/models/stream.model";
import { dynamicLoadScriptFromEnvVar } from "../DynamicLoad";
import { getDaysFrom } from "./EpisodeFilter";
// eslint-disable-next-line import/no-cycle
import { Params } from "./EpisodePicker";

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
  const daysFromLastTime = getDaysFrom(self, stream.history);
  let reinforcementFactor = 1;
  const { weight } = self;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;
  else
    reinforcementFactor = 1;

  return reinforcementFactor ** 1.5 * daysFromLastTime;
}

async function weightTag( { self }: Params): Promise<number> {
  let { weight } = self;

  if (!self.tags)
    return weight;

  const { tags } = self;
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
