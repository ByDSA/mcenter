import { SerieWithEpisodes } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { Picker } from "rand-picker";

export type Params<R> = {
  picker: Picker<R>;
  self: R;
  serie: SerieWithEpisodes;
  lastEp: R | null;
  stream: Stream;
};