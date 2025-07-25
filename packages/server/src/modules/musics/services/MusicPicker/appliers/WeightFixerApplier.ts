import { LastTimeWeightFilterFx, LastTimeWeightFixer, LimiterSafeIntegerPerItems, WeightFixerApplier } from "#modules/picker";
import { SECONDS_IN_HOUR, SECONDS_IN_MONTH, SECONDS_IN_WEEK } from "#modules/resources";
import { Pickable, Resource } from "#modules/resources/models";
import { MusicEntity } from "#musics/models";

export class MusicWeightFixerApplier<R extends Resource = Resource>
  extends WeightFixerApplier<R> {
  constructor() {
    super();
    this.add(new LastTimeWeightFixer( {
      fx,
    } ));
    // this.add(new TagWeightFixer());
    this.add(new LimiterSafeIntegerPerItems());
  }
}

const fx: LastTimeWeightFilterFx = (r: Pickable, secondsFromLastTime: number): number => {
  const weightFactor = weightFactorFx(r.weight);
  const timeFactor = timeFactorFx(secondsFromLastTime);

  return weightFactor * timeFactor;
};

function weightFactorFx(w: number): number {
  if (w < -1)
    return 1.0 / (-w);

  if (w > 1)
    return w;

  return 1;
}

function timeFactorFx(secondsFromLastTime: number): number {
  const secondsToOne = SECONDS_IN_HOUR;
  const minSecondsRise = 2 * SECONDS_IN_MONTH;

  if (secondsFromLastTime < secondsToOne)
    return (1.0 * secondsFromLastTime) / secondsToOne;

  if (secondsFromLastTime > minSecondsRise)
    return 1.0 + ((secondsFromLastTime - minSecondsRise) / SECONDS_IN_WEEK);

  return 1;
}

export function genWeightFixerApplier() {
  return new MusicWeightFixerApplier<MusicEntity>();
}
