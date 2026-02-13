import { assertIsDefined, neverCase } from "$shared/utils/validation";
import { EpisodeEntityWithUserInfo } from "$shared/models/episodes";
import { PickMode } from "#modules/picker/resource-picker/pick-mode";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { ResourcePickerSequential } from "#modules/picker/resource-picker/resource-picker-sequential";
import { ResourcePicker } from "#modules/picker/resource-picker/resource-picker";
import { EpisodeFilterApplier, EpisodeWeightFixerApplier } from "../appliers";
import { DependenciesList } from "../appliers/dependencies";

type R = EpisodeEntityWithUserInfo;

class EpisodePickerRandom extends ResourcePickerRandom<R> {
  constructor( { filterApplier, resources, weightFixerApplier, lastId }: {
    resources: R[];
    lastId: string | null;
    filterApplier: EpisodeFilterApplier;
    weightFixerApplier: EpisodeWeightFixerApplier;
  } ) {
    super( {
      filterApplier,
      resources,
      weightFixerApplier,
      lastId,
    } );
  }

  getId(r: R) {
    return r.id;
  }

  setLastTimePlayed(resource: R, time: Date): void {
    resource.userInfo.lastTimePlayed = time;
  }
}

type Params = {
  episodes: R[];
  lastId: string | null;
  mode: PickMode;
  dependencies?: DependenciesList;
};
export function buildEpisodePicker(
  { mode, episodes, lastId, dependencies }: Params,
): ResourcePicker<R> {
  let picker: ResourcePicker<R>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential( {
        resources: episodes,
        lastId,
        getId: e=>e.id,
      } );
      break;
    case PickMode.RANDOM:
      assertIsDefined(dependencies);
      picker = new EpisodePickerRandom( {
        resources: episodes,
        lastId,
        filterApplier: new EpisodeFilterApplier( {
          resources: episodes,
          lastId,
          dependencies,
        } ),
        weightFixerApplier: new EpisodeWeightFixerApplier(),
      } );
      break;
    default:
      neverCase(mode);
  }

  return picker;
}
