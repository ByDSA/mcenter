import type { FilterApplier } from "./filters";
import { DateTime } from "luxon";
import { Picker, newPicker } from "rand-picker";
import { assertIsDefined, assertIsNotEmpty } from "$shared/utils/validation";
import { Resource } from "#modules/resources/models";
import { EpisodeFilterApplier } from "#modules/episode-picker/appliers/FilterApplier";
import { EpisodeEntity } from "#episodes/models";
import { ResourcePicker } from "./ResourcePicker";
import { WeightFixerApplier } from "./weight-fixers";

type Params<R extends Resource> = {
  resources: R[];
  lastOne?: R;
  filterApplier: FilterApplier<R>;
  weightFixerApplier: WeightFixerApplier<R>;
};
export class ResourcePickerRandom<R extends Resource> implements ResourcePicker<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
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
        resource.lastTimePlayed = Math.floor(DateTime.now().toSeconds());
        lastOne = resource;
      }

      ret.push(resource);
    }

    return ret;
  }
}

export async function genRandomPickerWithData<R extends Resource>(
  { resources, lastOne, filterApplier, weightFixerApplier }: Params<R>,
): Promise<Picker<R>> {
  assertIsDefined(resources, "Undefined resources");
  assertIsNotEmpty(resources, "Empty resources");

  let newFilterApplier = filterApplier;

  if (filterApplier instanceof EpisodeFilterApplier) {
    newFilterApplier = new EpisodeFilterApplier( {
      dependencies: filterApplier.dependencies,
      lastEp: lastOne as EpisodeEntity | undefined ?? null,
      lastId: (lastOne as unknown as EpisodeEntity).compKey,
      resources: resources as unknown as EpisodeEntity[],
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
