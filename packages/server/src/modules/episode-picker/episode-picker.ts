import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { ResourcePickerSequential } from "#modules/picker/resource-picker/resource-picker-sequential";
import { ResourcePicker } from "#modules/picker/resource-picker/resource-picker";
import { compareEpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { DependenciesList } from "./appliers/dependencies";

class EpisodePickerRandom extends ResourcePickerRandom<EpisodeEntity> {
  constructor( { filterApplier, resources, weightFixerApplier, lastOne }: {
    resources: EpisodeEntity[];
    lastOne?: EpisodeEntity;
    filterApplier: ReturnType<typeof genEpisodeFilterApplier>;
    weightFixerApplier: ReturnType<typeof genEpisodeWeightFixerApplier>;
  } ) {
    super( {
      filterApplier,
      resources,
      weightFixerApplier,
      lastOne,
    } );
  }

  setLastTimePlayed(resource: EpisodeEntity, time: number): void {
    resource.lastTimePlayed = time;
  }
}

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
      picker = new EpisodePickerRandom( {
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
