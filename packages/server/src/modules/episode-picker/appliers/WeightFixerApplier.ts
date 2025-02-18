import { Episode } from "#episodes/models";
import { LastTimeWeightFilterFx, LastTimeWeightFixer, LimiterSafeIntegerPerItems, TagWeightFixer, WeightFixerApplier } from "#modules/picker";
import { Pickable, ResourceVO } from "#modules/resources/models";

const SECONDS_IN_DAY = 24 * 60 * 60;

export class EpisodeWeightFixerApplier<R extends ResourceVO = ResourceVO>
  extends WeightFixerApplier<R> {
  constructor() {
    super();
    this.add(new LastTimeWeightFixer( {
      fx,
    } ));
    this.add(new TagWeightFixer());
    this.add(new LimiterSafeIntegerPerItems());
  }
}

const fx: LastTimeWeightFilterFx = (r: Pickable, x: number): number => {
  const daysFromLastTime = x / SECONDS_IN_DAY;
  let reinforcementFactor = 1;
  const { weight } = r;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  const PICKER_DAYS_EXP = +(process.env.PICKER_DAYS_EXP ?? 1);

  return reinforcementFactor * (daysFromLastTime ** PICKER_DAYS_EXP);
};

export function genEpisodeWeightFixerApplier() {
  return new EpisodeWeightFixerApplier<Episode>();
}
