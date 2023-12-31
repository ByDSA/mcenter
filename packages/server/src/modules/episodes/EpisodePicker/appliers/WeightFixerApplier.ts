import { LastTimeWeightFixer, LimiterSafeIntegerPerItems, TagWeightFixer, WeightFixerApplier } from "#modules/picker";
import { Fx } from "#modules/picker/ResourcePicker/weight-fixers/LastTime";
import { Episode } from "#shared/models/episodes";
import { Pickable, ResourceVO } from "#shared/models/resource";

const SECONDS_IN_DAY = 24 * 60 * 60;

export default class EpisodeWeightFixerApplier<R extends ResourceVO = ResourceVO> extends WeightFixerApplier<R> {
  constructor() {
    super();
    this.add(new LastTimeWeightFixer( {
      fx,
    } ));
    this.add(new TagWeightFixer());
    this.add(new LimiterSafeIntegerPerItems());
  }
}

const fx: Fx = (r: Pickable, x: number): number => {
  const daysFromLastTime = x / SECONDS_IN_DAY;
  let reinforcementFactor = 1;
  const {weight} = r;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
};

export function genEpisodeWeightFixerApplier() {
  return new EpisodeWeightFixerApplier<Episode>();
}