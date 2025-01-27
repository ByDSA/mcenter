import { neverCase } from "#shared/utils/validation";
import { Episode } from "../episodes/models";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { dependencies } from "./appliers/Dependencies";
import { PickMode, ResourcePicker, ResourcePickerRandom, ResourcePickerSequential } from "#modules/picker";
import { compareEpisodeId } from "#episodes/models";

type Params = {
  episodes: Episode[];
  lastEp?: Episode;
  mode: PickMode;
};
export function buildEpisodePicker(
  { mode, episodes, lastEp }: Params,
): ResourcePicker<Episode> {
  let picker: ResourcePicker<Episode>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential( {
        resources: episodes,
        lastId: lastEp?.id,
        compareId: compareEpisodeId,
      } );
      break;
    case PickMode.RANDOM:
      picker = new ResourcePickerRandom<Episode>( {
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
