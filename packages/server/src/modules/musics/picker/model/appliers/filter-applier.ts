import { FilterApplier, PreventDisabledFilter, PreventRepeatInTimeFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { MusicEntity } from "#musics/models";

type Entity = MusicEntity;
export class PreventDisabledMusicFilter extends PreventDisabledFilter<Entity> {
  isDisabled(self: Entity): boolean {
    return !!self.disabled;
  }
}

export class RemoveWeightLowerOrEqualThanMusicFilter
  extends RemoveWeightLowerOrEqualThanFilter<Entity> {
  getWeight(self: Entity): number {
    return self.userInfo?.weight ?? 0;
  }
}

export class PreventRepeatInTimeMusicFilter extends PreventRepeatInTimeFilter<Entity> {
  getLastTimePlayed(self: Entity): Date | null {
    if (self.userInfo?.lastTimePlayed === undefined)
      return null;

    return new Date(self.userInfo.lastTimePlayed * 1_000);
  }
}

type Params = {
  resources: Entity[];
  lastId: string | null;
};
export class MusicFilterApplier extends FilterApplier<Entity> {
  #params: Params;

  constructor(params: Params) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  #createFilters(): void {
    const { PICKER_MIN_WEIGHT = -99 } = process.env;
    const { lastId } = this.#params;

    this.add(new PreventDisabledMusicFilter());

    if (lastId) {
      this.addReversible(new PreventRepeatLastFilter<Entity>(
        {
          lastId,
          getId: (m)=>m.id,
        },
      ));
    }

    this.add(new RemoveWeightLowerOrEqualThanMusicFilter(+PICKER_MIN_WEIGHT));

    const minSecondsElapsed = 30 * 60;

    this.addReversible(new PreventRepeatInTimeMusicFilter( {
      minSecondsElapsed,
    } ));
  }
}
