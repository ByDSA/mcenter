import { LastTimeWeightFixer, LimiterSafeIntegerPerItems, TagWeightFixer, WeightFixerApplier } from "#modules/picker";
import { Episode } from "#shared/models/episodes";
import { Pickable, Resource } from "#shared/models/resource";
import { isDefined } from "#shared/utils/validation";

const SECONDS_IN_DAY = 24 * 60 * 60;

export default class EpisodeWeightFixerApplier<R extends Resource = Resource> extends WeightFixerApplier<R> {
  constructor() {
    super();
    this.add(new LastTimeWeightFixer( {
      fx,
      getLastTimePicked,
    } ));
    this.add(new TagWeightFixer());
    this.add(new LimiterSafeIntegerPerItems());
  }
}

const fx = (r: Pickable, x: number): number => {
  const daysFromLastTime = x / SECONDS_IN_DAY;
  let reinforcementFactor = 1;
  const {weight} = r;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
};

function getLastTimePicked(self: Resource): number {
  let lastTimePicked: number | undefined;

  lastTimePicked = self.lastTimePlayed;

  if (!isDefined(lastTimePicked))
    lastTimePicked = Number.MAX_SAFE_INTEGER;

  if (lastTimePicked < 0 || Number.isNaN(lastTimePicked))
    throw new Error(`Invalid secondsFromLastTime: ${lastTimePicked}`);

  return lastTimePicked;
};

export function genEpisodeWeightFixerApplier() {
  return new EpisodeWeightFixerApplier<Episode>();
}