import { Picker } from "rand-picker";
import { Serie } from "#modules/series/serie";
import { Stream } from "#modules/stream";
import { Episode } from "../model";

export type Params = {
  picker: Picker<Episode>;
  self: Episode;
  serie: Serie;
  lastEp: Episode | null;
  stream: Stream;
};