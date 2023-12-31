/* eslint-disable import/prefer-default-export */
import { FilterApplier, PreventDisabledFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { Music, compareMusicId } from "#shared/models/musics";
import { Resource } from "#shared/models/resource";

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
    const { PICKER_MIN_WEIGHT = -99, PICKER_MIN_DAYS = 0 } = process.env;
    const {lastEp, lastId} = this.#params;

    this.add(new PreventDisabledFilter());

    if (lastEp) {
      this.add(new PreventRepeatLastFilter<ModelId, Model>(
        {
          lastId,
          compareId: compareMusicId,
        } ));
    }

    this.add(new RemoveWeightLowerOrEqualThanFilter(+PICKER_MIN_WEIGHT));

    // this.add(new PreventRepeatInDaysFilter( {
    //   minDays: +PICKER_MIN_DAYS,
    //   lastTimePlayed: lastEp?.lastTimePlayed ?? 0,
    // } ));
  }
}

export function genFilterApplier(resources: Model[], lastOne?: Model) {
  return new MusicFilterApplier( {
    resources,
    lastEp: lastOne ?? null,
    lastId: lastOne?.id,
  } );
}