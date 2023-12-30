/* eslint-disable import/prefer-default-export */
import { FilterApplier, PreventDisabledFilter, PreventRepeatInDaysFilter, PreventRepeatLastFilter, RemoveWeightLowerOrEqualThanFilter } from "#modules/picker";
import { Music, getIdOfMusic } from "#shared/models/musics";
import { ResourceVO } from "#shared/models/resource";

type Model = Music;
type ModelId = string;

const compareResourceWithId = (m: Model, id: ModelId) =>m.url === id;

type Params<R extends ResourceVO = ResourceVO, ID = string> = {
  resources: R[];
  lastEp: R | null;
  lastId: ID | undefined;
};
export default class MusicFilterApplier extends FilterApplier<Model> {
  #params: Params<Model, ModelId>;

  constructor(params: Params<Model, ModelId>) {
    super();
    this.#params = params;

    this.#createFilters();
  }

  #createFilters(): void {
    const { PICKER_MIN_WEIGHT = -99, PICKER_MIN_DAYS = 0 } = process.env;
    const {lastEp, lastId} = this.#params;

    this.add(new PreventDisabledFilter());

    if (lastEp) {
      this.add(new PreventRepeatLastFilter(
        {
          lastId,
          compareResourceWithId,
        } ));
    }

    this.add(new RemoveWeightLowerOrEqualThanFilter(+PICKER_MIN_WEIGHT));

    this.add(new PreventRepeatInDaysFilter( {
      minDays: +PICKER_MIN_DAYS,
      lastTimePlayed: lastEp?.lastTimePlayed ?? 0,
    } ));
  }
}

export function genFilterApplier(resources: Model[], lastOne?: Model) {
  return new MusicFilterApplier( {
    resources,
    lastEp: lastOne ?? null,
    lastId: lastOne ? getIdOfMusic(lastOne) : undefined,
  } );
}