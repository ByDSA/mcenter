import Episode from "../models/Episode";

export default interface EpisodePicker {
  pick(n: number): Promise<Episode[]>;
}