import { LastTimeWeightFilterFx, LastTimeWeightFixer, LimiterSafeIntegerPerItems, TagWeightFixer, WeightFixerApplier } from "#modules/picker";
import { Pickable } from "#modules/resources/models";
import { EpisodeEntity } from "#episodes/models";

const SECONDS_IN_DAY = 24 * 60 * 60;

class LastTimeEpisodeWeightFixer extends LastTimeWeightFixer<EpisodeEntity> {
  getLastTimePlayed(r: EpisodeEntity): number {
    return r.lastTimePlayed ?? 0;
  }
}

export class EpisodeWeightFixerApplier
  extends WeightFixerApplier<EpisodeEntity> {
  constructor() {
    super();
    this.add(new LastTimeEpisodeWeightFixer( {
      fx,
    } ));
    this.add(new TagWeightFixer());
    this.add(new LimiterSafeIntegerPerItems());
  }
}

const fx: LastTimeWeightFilterFx<EpisodeEntity> = (r: Pickable, x: number): number => {
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
  return new EpisodeWeightFixerApplier();
}
