import { neverCase } from "$shared/utils/validation";
import { PickMode, ResourcePicker, ResourcePickerRandom, ResourcePickerSequential } from "#modules/picker";
import { MusicEntity } from "#musics/models";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "./appliers";

type Entity = MusicEntity;
type ModelId = string;
type Params = {
  episodes: Entity[];
  lastOne?: Entity;
  mode: PickMode;
};
export function buildMusicPicker(
  { mode, episodes, lastOne }: Params,
): ResourcePicker<Entity> {
  let picker: ResourcePicker<MusicEntity>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential<ModelId, Entity>( {
        resources: episodes,
        lastId: lastOne ? lastOne.url : undefined,
        compareId: (a, b) => a === b,
      } );
      break;
    case PickMode.RANDOM:
      picker = new ResourcePickerRandom<Entity>( {
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
