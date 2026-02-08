import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { EpisodeEntityWithUserInfo } from "$shared/models/episodes";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { ResourcePickerSequential } from "#modules/picker/resource-picker/resource-picker-sequential";
import { ResourcePicker } from "#modules/picker/resource-picker/resource-picker";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { DependenciesList } from "./appliers/dependencies";

class EpisodePickerRandom extends ResourcePickerRandom<EpisodeEntityWithUserInfo> {
  constructor( { filterApplier, resources, weightFixerApplier, lastOne }: {
    resources: EpisodeEntityWithUserInfo[];
    lastOne?: EpisodeEntityWithUserInfo;
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

  setLastTimePlayed(resource: EpisodeEntityWithUserInfo, time: Date): void {
    resource.userInfo.lastTimePlayed = time;
  }
}

type Params = {
  episodes: EpisodeEntityWithUserInfo[];
  lastEp?: EpisodeEntityWithUserInfo;
  mode: PickMode;
  dependencies?: DependenciesList;
};
export function buildEpisodePicker(
  { mode, episodes, lastEp, dependencies }: Params,
): ResourcePicker<EpisodeEntityWithUserInfo> {
  let picker: ResourcePicker<EpisodeEntityWithUserInfo>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential( {
        resources: episodes,
        lastId: lastEp?.id,
        compareId: (a, b) => a === b,
        getId: e=>e.id,
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
