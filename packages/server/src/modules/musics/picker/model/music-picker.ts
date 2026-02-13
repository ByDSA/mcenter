import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { MusicEntity } from "#musics/models";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { MusicFilterApplier, MusicWeightFixerApplier } from "./appliers";

type R = MusicEntity;

type ParamsPicker = {
  resources: R[];
  lastId: string | null;
  filterApplier: MusicFilterApplier;
  weightFixerApplier: MusicWeightFixerApplier;
};
export class MusicPickerRandom extends ResourcePickerRandom<R> {
  constructor( { filterApplier, resources, weightFixerApplier, lastId }: ParamsPicker) {
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

  setLastTimePlayed(resource: R, date: Date): void {
    const time = dateToTimestampInSeconds(date);

    if (resource.userInfo)
      resource.userInfo.lastTimePlayed = time;
    else {
      resource.userInfo = {
        userId: null!,
        musicId: resource.id,
        weight: 0,
        lastTimePlayed: time,
        createdAt: null!,
        updatedAt: null!,
      };
    }
  }
}
