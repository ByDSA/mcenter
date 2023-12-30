import { Resource } from "#shared/models/resource";
import { DateTime } from "luxon";
import { Picker, newPicker } from "rand-picker";
import ResourcePicker from "./ResourcePicker";
import { FilterApplier } from "./filters";
import { WeightFixerApplier } from "./weight-fixers";

type Params<R extends Resource> = {
  resources: R[];
  lastEp?: R;
  filterApplier: FilterApplier<R>;
  weightFixerApplier: WeightFixerApplier<R>;
};
export default class RandomPicker<R extends Resource> implements ResourcePicker<R> {
  #params: Params<R>;

  constructor(params: Params<R>) {
    this.#params = params;
  }

  async pick(n: number): Promise<R[]> {
    const ret: R[] = [];
    const {resources} = this.#params;
    let {lastEp} = this.#params;

    for (let i = 0; i < n; i++) {
      console.log("Picking one ...");
      // eslint-disable-next-line no-await-in-loop
      const picker = await genRandomPickerWithData( {
        ...this.#params,
        lastEp,
      } );
      const episode: R | undefined = picker.pickOne();

      if (!episode)
        throw new Error("Picker has no data");

      if (i < n - 1) {
        episode.lastTimePlayed = Math.floor(DateTime.now().toSeconds());
        lastEp = episode;
      }

      resources.push(episode);
    }

    return ret as R[];
  }
}

export async function genRandomPickerWithData<R extends Resource>( {resources, filterApplier, weightFixerApplier }: Params<R>): Promise<Picker<R>> {
  console.log("Getting random picker...");

  if (resources.length === 0)
    throw new Error("Empty resources");

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