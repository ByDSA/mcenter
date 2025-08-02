import { FilterApplier, PreventDisabledFilter, PreventRepeatInTimeFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { Resource } from "#modules/resources/models";
import { MusicEntity, compareMusicId } from "#musics/models";

type Entity = MusicEntity;
type ModelId = string;

type Params<ID, R extends Resource = Resource> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
};
export class MusicFilterApplier extends FilterApplier<Entity> {
  #params: Params<ModelId, Entity>;

  constructor(params: Params<ModelId, Entity>) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  #createFilters(): void {
    const { PICKER_MIN_WEIGHT = -99 } = process.env;
    const { lastEp, lastId } = this.#params;

    this.add(new PreventDisabledFilter());

    if (lastEp) {
      this.addReversible(new PreventRepeatLastFilter<ModelId, Entity>(
        {
          lastId,
          compareId: compareMusicId,
          getResourceId: (m)=>m.id,
        },
      ));
    }

    this.add(new RemoveWeightLowerOrEqualThanFilter(+PICKER_MIN_WEIGHT));

    const minSecondsElapsed = 30 * 60;

    this.addReversible(new PreventRepeatInTimeFilter( {
      minSecondsElapsed,
    } ));
  }
}

export function genFilterApplier(resources: Entity[], lastOne?: Entity) {
  return new MusicFilterApplier( {
    resources,
    lastEp: lastOne ?? null,
    lastId: lastOne?.id,
  } );
}
