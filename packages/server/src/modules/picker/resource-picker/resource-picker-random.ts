import type { FilterApplier } from "./filters";
import { Picker, newPicker } from "rand-picker";
import { assertIsDefined, assertIsNotEmpty } from "$shared/utils/validation";
import { EpisodeFilterApplier } from "#episodes/picker/appliers/filter-applier";
import { EpisodeEntityWithUserInfo } from "#episodes/models";
import { ResourcePicker } from "./resource-picker";
import { WeightFixerApplier } from "./weight-fixers";

type Params<R> = {
  resources: R[];
  lastId: string | null;
  filterApplier: FilterApplier<R>;
  weightFixerApplier: WeightFixerApplier<R>;
};
export abstract class ResourcePickerRandom<R> implements ResourcePicker<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  abstract getId(r: R): string;

  async pick(n: number): Promise<R[]> {
    const ret: R[] = [];
    let { lastId } = this.#params;

    for (let i = 0; i < n; i++) {
      const picker = await genRandomPickerWithData( {
        ...this.#params,
        lastId,
      } );
      const resource: R | undefined = picker.pickOne();

      assertIsDefined(resource, "Picker has no data");

      if (i < n - 1) {
        this.setLastTimePlayed(resource, new Date());

        lastId = this.getId(resource);
      }

      ret.push(resource);
    }

    return ret;
  }

  abstract setLastTimePlayed(resource: R, time: Date): void;
}

export async function genRandomPickerWithData<R>(
  { resources, lastId, filterApplier, weightFixerApplier }: Params<R>,
): Promise<Picker<R>> {
  assertIsDefined(resources, "Undefined resources");
  assertIsNotEmpty(resources, "Empty resources");

  let newFilterApplier = filterApplier;

  if (filterApplier instanceof EpisodeFilterApplier) {
    newFilterApplier = new EpisodeFilterApplier( {
      dependencies: filterApplier.dependencies,
      lastId,
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
