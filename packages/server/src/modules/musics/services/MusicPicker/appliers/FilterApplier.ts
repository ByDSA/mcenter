import { Music, compareMusicId } from "#shared/models/musics";
import { Resource } from "#shared/models/resource";
import { FilterApplier, PreventDisabledFilter, PreventRepeatInTimeFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";

type Model = Music;
type ModelId = string;

type Params<ID, R extends Resource<ID> = Resource<ID>> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
};
export default class MusicFilterApplier extends FilterApplier<Model> {
  #params: Params<ModelId, Model>;

  constructor(params: Params<ModelId, Model>) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  #createFilters(): void {
    const { PICKER_MIN_WEIGHT = -99 } = process.env;
    const { lastEp, lastId } = this.#params;

    this.add(new PreventDisabledFilter());

    if (lastEp) {
      this.addReversible(new PreventRepeatLastFilter<ModelId, Model>(
        {
          lastId,
          compareId: compareMusicId,
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

export function genFilterApplier(resources: Model[], lastOne?: Model) {
  return new MusicFilterApplier( {
    resources,
    lastEp: lastOne ?? null,
    lastId: lastOne?.id,
  } );
}
