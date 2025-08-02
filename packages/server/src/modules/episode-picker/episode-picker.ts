import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { ResourcePickerSequential } from "#modules/picker/resource-picker/resource-picker-sequential";
import { ResourcePicker } from "#modules/picker/resource-picker/resource-picker";
import { compareEpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { DependenciesList } from "./appliers/dependencies";

type Params = {
  episodes: EpisodeEntity[];
  lastEp?: EpisodeEntity;
  mode: PickMode;
  dependencies?: DependenciesList;
};
export function buildEpisodePicker(
  { mode, episodes, lastEp, dependencies }: Params,
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
      assertIsDefined(dependencies);
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
