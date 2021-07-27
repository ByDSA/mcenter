/* eslint-disable require-await */
/* eslint-disable import/no-cycle */
import { newPicker, Picker } from "rand-picker";
import { GroupInterface } from "../db/models/group";
import { ItemGroup } from "../db/models/group/interface";
import { HistoryInterface } from "../db/models/history";
import { HistoryItem } from "../db/models/history/interface";
import { findResourceFromItem } from "../db/models/resource";
import { Mode } from "../db/models/stream.model";
import filter from "./filter";
import fixWeight from "./weight";

export type GroupPicker = {
group: GroupInterface,
history: HistoryInterface,
mode: Mode,
};

export default async function pickNext( { group, history, mode }: GroupPicker) {
  console.log("Calculating next episode...");

  switch (mode) {
    case Mode.SEQUENTIAL:
      return getNextEpisodeSequential(group, history);
    case Mode.RANDOM:
      return getNextEpisodeRandom(group, history);
    default:
      throw new Error(`Mode invalid: ${mode}.`);
  }
}

export function getLastItemFromHistory(history: HistoryInterface) {
  const content = <HistoryItem[]>history.content;
  const lastItem = content[content.length - 1];

  return lastItem;
}

export async function findLastResourceFromHistory(history: HistoryInterface) {
  const lastEntry = getLastItemFromHistory(history);
  const resource = await findResourceFromItem( {
    type: lastEntry.typeResource,
    id: lastEntry.idResource,
  } );

  return resource;
}

async function getNextEpisodeSequential(
  group: GroupInterface,
  history: HistoryInterface,
): Promise<ItemGroup> {
  const episodes = <ItemGroup[]>group.content;
  let i = 0;
  const last = await findLastResourceFromHistory(history);

  if (last) {
    // eslint-disable-next-line no-underscore-dangle
    i = episodes.findIndex((e) => e.id === last._id) + 1;

    if (i >= episodes.length)
      i = 0;
  }

  return episodes[i];
}

export async function getRandomPicker(
  group: GroupInterface, history: HistoryInterface,
) {
  console.log("Getting random picker...");
  const episodes = <ItemGroup[]>group.content;

  if (!episodes)
    throw new Error();

  const picker = newPicker(episodes, {
    weighted: true,
  } );

  await filter(picker, group, history);
  await fixWeight(picker, group, history);

  return picker;
}

async function getNextEpisodeRandom(
  group: GroupInterface,
  history: HistoryInterface,
): Promise<ItemGroup> {
  const picker = await getRandomPicker(group, history);
  const ret = picker.pickOne();

  if (!ret)
    throw new Error();

  return ret;
}

export type Params = {
    picker: Picker<ItemGroup>,
    self: ItemGroup,
    group: GroupInterface,
    history: HistoryInterface,
};
