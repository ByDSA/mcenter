import { neverCase } from "$shared/utils/validation";
import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { PickMode, ResourcePicker, ResourcePickerSequential } from "#modules/picker";
import { MusicEntity } from "#musics/models";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { genMusicFilterApplier, genMusicWeightFixerApplier, MusicFilterApplier, MusicWeightFixerApplier } from "./appliers";

type Entity = MusicEntity;
type ModelId = string;

type ParamsPicker = {
  resources: Entity[];
  lastOne?: MusicEntity;
  filterApplier: MusicFilterApplier;
  weightFixerApplier: MusicWeightFixerApplier;
};
export class MusicPickerRandom extends ResourcePickerRandom<Entity, MusicEntity> {
  constructor( { filterApplier, resources, weightFixerApplier, lastOne }: ParamsPicker) {
    super( {
      filterApplier,
      resources,
      weightFixerApplier,
      lastOne,
    } );
  }

  setLastTimePlayed(resource: Entity, date: Date): void {
    const time = dateToTimestampInSeconds(date);

    if (resource.userInfo)
      resource.userInfo.lastTimePlayed = time;
    else {
      resource.userInfo = {
        lastTimePlayed: time,
        weight: 0,
        createdAt: new Date(),
        musicId: resource.id,
        updatedAt: new Date(),
        userId: null!,
      };
    }
  }
}
type Params = {
  episodes: Entity[];
  lastOne?: MusicEntity;
  mode: PickMode;
};
export function buildMusicPicker(
  { mode, episodes, lastOne }: Params,
): ResourcePicker<Entity> {
  let picker: ResourcePicker<Entity>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential<ModelId, Entity>( {
        resources: episodes,
        lastId: lastOne ? lastOne.slug : undefined,
        compareId: (a, b) => a === b,
        getId: e=>e.id,
      } );
      break;
    case PickMode.RANDOM:
      picker = new MusicPickerRandom( {
        resources: episodes,
        lastOne,
        filterApplier: genMusicFilterApplier(episodes, lastOne),
        weightFixerApplier: genMusicWeightFixerApplier(),
      } );
      break;
    default:
      neverCase(mode);
  }

  return picker;
}
