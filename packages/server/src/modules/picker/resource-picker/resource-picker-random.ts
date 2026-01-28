import type { FilterApplier } from "./filters";
import { DateTime } from "luxon";
import { Picker, newPicker } from "rand-picker";
import { assertIsDefined, assertIsNotEmpty } from "$shared/utils/validation";
import { ResourcePicker } from "./resource-picker";
import { WeightFixerApplier } from "./weight-fixers";
import { EpisodeFilterApplier } from "#episodes/streams/picker/appliers/filter-applier";
import { EpisodeEntity, EpisodeEntityWithUserInfo } from "#episodes/models";

type Params<R, L = R> = {
  resources: R[];
  lastOne?: L;
  filterApplier: FilterApplier<R>;
  weightFixerApplier: WeightFixerApplier<R>;
};
export abstract class ResourcePickerRandom<R extends L, L = R> implements ResourcePicker<R> {
  #params: Params<R, L>;

  constructor(params: Params<R, L>) {
    this.#params = params;
  }

  async pick(n: number): Promise<R[]> {
    const ret: R[] = [];
    let { lastOne } = this.#params;

    for (let i = 0; i < n; i++) {
      const picker = await genRandomPickerWithData( {
        ...this.#params,
        lastOne,
      } );
      const resource: R | undefined = picker.pickOne();

      assertIsDefined(resource, "Picker has no data");

      if (i < n - 1) {
        this.setLastTimePlayed(resource, Math.floor(DateTime.now().toSeconds()));

        lastOne = resource;
      }

      ret.push(resource);
    }

    return ret;
  }

  abstract setLastTimePlayed(resource: R, time: number): void;
}

export async function genRandomPickerWithData<R, L>(
  { resources, lastOne, filterApplier, weightFixerApplier }: Params<R, L>,
): Promise<Picker<R>> {
  assertIsDefined(resources, "Undefined resources");
  assertIsNotEmpty(resources, "Empty resources");

  let newFilterApplier = filterApplier;

  if (filterApplier instanceof EpisodeFilterApplier) {
    newFilterApplier = new EpisodeFilterApplier( {
      dependencies: filterApplier.dependencies,
      lastEp: lastOne as EpisodeEntityWithUserInfo | undefined ?? null,
      lastId: (lastOne as unknown as EpisodeEntity).compKey,
      resources: resources as unknown as EpisodeEntityWithUserInfo[],
    } ) as unknown as FilterApplier<R>;
  }

  const dataToAdd = await newFilterApplier.apply(resources);

  // default case
  if (dataToAdd.length === 0)
    dataToAdd.push(resources[0]);

  const picker: Picker<R> = newPicker(dataToAdd, {
    weighted: true,
  } );

  await weightFixerApplier.apply(picker);

  return picker;
}
