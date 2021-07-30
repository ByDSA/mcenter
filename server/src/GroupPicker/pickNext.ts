import { HistoryInterface } from "@models/history";
import { GroupInterface } from "@models/resources/group";
import Mode from "./mode";
import getNextEpisodeRandom from "./pickNextRand";
import getNextEpisodeSequential from "./pickNextSeq";

export type PickNextParams = {
  group: GroupInterface,
  history?: HistoryInterface,
  mode: Mode,
};

export default function pickNext( { group, history, mode }: PickNextParams) {
  switch (mode) {
    case Mode.SEQUENTIAL:
      return getNextEpisodeSequential(group, history);
    case Mode.RANDOM:
      return getNextEpisodeRandom(group, history);
    default:
      throw new Error(`Mode invalid: ${mode}.`);
  }
}
