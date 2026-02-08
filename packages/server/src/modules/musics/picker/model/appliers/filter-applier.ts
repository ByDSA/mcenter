import { FilterApplier, PreventDisabledFilter, PreventRepeatInTimeFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { MusicEntity, compareMusicId } from "#musics/models";

type Entity = MusicEntity;
type ModelId = string;
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
    return self.userInfo?.lastTimePlayed === undefined
      ? null
      : new Date(self.userInfo?.lastTimePlayed * 1_000);
  }
}

type Params = {
  resources: Entity[];
  lastEp: MusicEntity | null;
  lastId: ModelId | undefined;
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
    const { lastEp, lastId } = this.#params;

    this.add(new PreventDisabledMusicFilter());

    if (lastEp) {
      this.addReversible(new PreventRepeatLastFilter<ModelId, Entity>(
        {
          lastId,
          compareId: compareMusicId,
          getResourceId: (m)=>m.id,
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

export function genFilterApplier(resources: Entity[], lastOne?: MusicEntity) {
  return new MusicFilterApplier( {
    resources,
    lastEp: lastOne ?? null,
    lastId: lastOne?.id,
  } );
}
