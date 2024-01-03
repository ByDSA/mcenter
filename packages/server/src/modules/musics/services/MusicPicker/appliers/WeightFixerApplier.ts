import { LastTimeWeightFilterFx, LastTimeWeightFixer, WeightFixerApplier } from "#modules/picker";
import { Music } from "#shared/models/musics";
import { Pickable, ResourceVO } from "#shared/models/resource";

export default class MusicWeightFixerApplier<R extends ResourceVO = ResourceVO> extends WeightFixerApplier<R> {
  constructor() {
    super();
    this.add(new LastTimeWeightFixer( {
      fx,
    } ));
    // this.add(new TagWeightFixer());
    // this.add(new LimiterSafeIntegerPerItems());
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fx: LastTimeWeightFilterFx = (r: Pickable, _x: number): number => {
  const daysFromLastTime = 1;// x / SECONDS_IN_DAY; // TODO: ignorar tiempo por ahora
  let reinforcementFactor = 1;
  const {weight} = r;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
};

export function genWeightFixerApplier() {
  return new MusicWeightFixerApplier<Music>();
}