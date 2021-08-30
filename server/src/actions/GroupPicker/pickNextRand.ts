import { getLastItemFromHistory, HistoryInterface } from "@models/history";
import { GroupInterface } from "@models/resources/group";
import { ItemGroup } from "@models/resources/group/interface";
import { findResourceByTypeAndId } from "@models/resources/types";
import { newPicker } from "rand-picker";
import filter from "./filter";
import { Params } from "./Params";
import fixWeight from "./weight";

export async function findLastResourceFromHistory(history: HistoryInterface) {
  const lastEntry = getLastItemFromHistory(history);
  const resource = await findResourceByTypeAndId( {
    type: lastEntry.typeResource,
    id: lastEntry.idResource,
  } );

  return resource;
}

function getPickerFromGroup(group: GroupInterface) {
  const episodes = <ItemGroup[]>group.content;

  if (!episodes)
    return null;

  const picker = newPicker(episodes, {
    weighted: true,
  } );

  return picker;
}

export async function getPickerRandom(
  group: GroupInterface,
  history?: HistoryInterface,
) {
  const picker = getPickerFromGroup(group);

  if (!picker)
    throw new Error();

  const params: Params = {
    picker,
    group,
    history,
  };

  await filter(params);
  await fixWeight(params);

  return picker;
}

export default async function getNextEpisodeRandom(
  group: GroupInterface,
  history?: HistoryInterface,
): Promise<ItemGroup> {
  const picker = await getPickerRandom(group, history);
  const ret = picker.pickOne();

  if (!ret)
    throw new Error();

  return ret;
}
