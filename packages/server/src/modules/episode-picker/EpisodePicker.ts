import { neverCase } from "$shared/utils/validation";
import { PickMode, ResourcePicker, ResourcePickerRandom, ResourcePickerSequential } from "#modules/picker";
import { compareEpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { dependencies } from "./appliers/Dependencies";

type Params = {
  episodes: EpisodeEntity[];
  lastEp?: EpisodeEntity;
  mode: PickMode;
};
export function buildEpisodePicker(
  { mode, episodes, lastEp }: Params,
): ResourcePicker<EpisodeEntity> {
  let picker: ResourcePicker<EpisodeEntity>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential( {
        resources: episodes,
        lastId: lastEp?.compKey,
        compareId: compareEpisodeCompKey,
        getId: e=>e.compKey,
      } );
      break;
    case PickMode.RANDOM:
      picker = new ResourcePickerRandom<EpisodeEntity>( {
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
