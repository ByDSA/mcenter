import { LastTimeWeightFixer, WeightFixerApplier } from "#modules/picker";
import { Music } from "#shared/models/musics";
import { Pickable, ResourceVO } from "#shared/models/resource";
import { isDefined } from "#shared/utils/validation";

export default class MusicWeightFixerApplier<R extends ResourceVO = ResourceVO> extends WeightFixerApplier<R> {
  constructor() {
    super();
    this.add(new LastTimeWeightFixer( {
      fx,
      getLastTimePicked,
    } ));
    // this.add(new TagWeightFixer());
    // this.add(new LimiterSafeIntegerPerItems());
  }
}

const fx = (r: Pickable, x: number): number => {
  const daysFromLastTime = 1;// x / SECONDS_IN_DAY; // TODO: ignorar tiempo por ahora
  let reinforcementFactor = 1;
  const {weight} = r;

  if (weight < -1)
    reinforcementFactor = 1.0 / (-weight);
  else if (weight > 1)
    reinforcementFactor = weight;

  return reinforcementFactor * daysFromLastTime;
};

function getLastTimePicked(self: ResourceVO): number {
  let lastTimePicked: number | undefined;

  lastTimePicked = self.lastTimePlayed;

  if (!isDefined(lastTimePicked))
    lastTimePicked = Number.MAX_SAFE_INTEGER;

  if (lastTimePicked < 0 || Number.isNaN(lastTimePicked))
    throw new Error(`Invalid secondsFromLastTime: ${lastTimePicked}`);

  return lastTimePicked;
};

export function genWeightFixerApplier() {
  return new MusicWeightFixerApplier<Music>();
}