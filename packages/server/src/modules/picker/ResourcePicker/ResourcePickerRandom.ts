import { DateTime } from "luxon";
import { Picker, newPicker } from "rand-picker";
import { assertIsDefined, assertIsNotEmpty } from "$shared/utils/validation";
import { Resource } from "#modules/resources/models";
import { ResourcePicker } from "./ResourcePicker";
import { FilterApplier } from "./filters";
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
    let { lastOne: lastEp } = this.#params;

    for (let i = 0; i < n; i++) {
      const picker = await genRandomPickerWithData( {
        ...this.#params,
        lastOne: lastEp,
      } );
      const resource: R | undefined = picker.pickOne();

      assertIsDefined(resource, "Picker has no data");

      if (i < n - 1) {
        resource.lastTimePlayed = Math.floor(DateTime.now().toSeconds());
        lastEp = resource;
      }

      ret.push(resource);
    }

    return ret;
  }
}

export async function genRandomPickerWithData<R extends Resource>(
  { resources, filterApplier, weightFixerApplier }: Params<R>,
): Promise<Picker<R>> {
  assertIsDefined(resources, "Undefined resources");
  assertIsNotEmpty(resources, "Empty resources");

  const dataToAdd = await filterApplier.apply(resources);

  // default case
  if (dataToAdd.length === 0)
    dataToAdd.push(resources[0]);

  const picker: Picker<R> = newPicker(dataToAdd, {
    weighted: true,
  } );

  await weightFixerApplier.apply(picker);

  return picker;
}
