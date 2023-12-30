import { PickMode, ResourcePicker, ResourcePickerRandom, ResourcePickerSequential } from "#modules/picker/ResourcePicker";
import { neverCase } from "#shared/utils/validation";
import { compareEpisodeFullId } from "..";
import { Model, ModelFullId, fullIdOf } from "../models";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { dependencies } from "./appliers/Dependencies";

type Params = {
  episodes: Model[];
  lastEp?: Model;
  mode: PickMode;
};
export default function buildEpisodePicker( { mode, episodes, lastEp }: Params): ResourcePicker<Model> {
  let picker: ResourcePicker<Model>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential<Model, ModelFullId>( {
        resources: episodes,
        lastId: lastEp ? fullIdOf(lastEp) : undefined,
        compareResourceWithId: compareEpisodeFullId,
      } );
      break;
    case PickMode.RANDOM:
      picker = new ResourcePickerRandom<Model>( {
        resources: episodes,
        lastEp,
        filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp),
        weightFixerApplier: genEpisodeWeightFixerApplier(),
      } );
      break;
    default:
      neverCase(mode);
  }

  return picker;
}