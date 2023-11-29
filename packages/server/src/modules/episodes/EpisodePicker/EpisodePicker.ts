import { Model } from "../models";

export default interface EpisodePicker {
  pick(n: number): Promise<Model[]>;
}