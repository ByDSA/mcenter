import { compareEpisodeId } from "#shared/models/episodes";
import { neverCase } from "#shared/utils/validation";
import { Model } from "../episodes/models";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { dependencies } from "./appliers/Dependencies";
import { PickMode, ResourcePicker, ResourcePickerRandom, ResourcePickerSequential } from "#modules/picker";

type Params = {
  episodes: Model[];
  lastEp?: Model;
  mode: PickMode;
};
export default function buildEpisodePicker(
  { mode, episodes, lastEp }: Params,
): ResourcePicker<Model> {
  let picker: ResourcePicker<Model>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential( {
        resources: episodes,
        lastId: lastEp?.id,
        compareId: compareEpisodeId,
      } );
      break;
    case PickMode.RANDOM:
      picker = new ResourcePickerRandom<Model>( {
        resources: episodes,
        lastOne: lastEp,
        filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp),
        weightFixerApplier: genEpisodeWeightFixerApplier(),
      } );
      break;
    default:
      neverCase(mode);
  }

  return picker;
}
