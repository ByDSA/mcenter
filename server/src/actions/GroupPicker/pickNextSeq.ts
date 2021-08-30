import { HistoryInterface } from "@models/history";
import { GroupInterface } from "@models/resources/group";
import { ItemGroup } from "@models/resources/group/interface";
import { findLastResourceFromHistory } from "./pickNextRand";

export default async function getNextEpisodeSequential(
  group: GroupInterface,
  history?: HistoryInterface,
): Promise<ItemGroup> {
  const episodes = <ItemGroup[]>group.content;
  let i = 0;

  if (history) {
    const last = await findLastResourceFromHistory(history);

    if (last) {
    // eslint-disable-next-line no-underscore-dangle
      i = episodes.findIndex((e) => e.id === last._id) + 1;

      if (i >= episodes.length)
        i = 0;
    }
  }

  return episodes[i];
}
