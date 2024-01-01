import { PickMode, ResourcePicker, ResourcePickerRandom, ResourcePickerSequential } from "#modules/picker";
import { Music } from "#shared/models/musics";
import { neverCase } from "#shared/utils/validation";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "./appliers";

type Model = Music;
type ModelId = string;
type Params = {
  episodes: Model[];
  lastOne?: Model;
  mode: PickMode;
};
export default function buildMusicPicker( { mode, episodes, lastOne }: Params): ResourcePicker<Model> {
  let picker: ResourcePicker<Music>;

  switch (mode) {
    case PickMode.SEQUENTIAL:
      picker = new ResourcePickerSequential<ModelId, Model>( {
        resources: episodes,
        lastId: lastOne ? lastOne.url : undefined,
        compareId: (a, b) => a === b,
      } );
      break;
    case PickMode.RANDOM:
      picker = new ResourcePickerRandom<Model>( {
        resources: episodes,
        lastEp: lastOne,
        filterApplier: genMusicFilterApplier(episodes, lastOne),
        weightFixerApplier: genMusicWeightFixerApplier(),
      } );
      break;
    default:
      neverCase(mode);
  }

  return picker;
}