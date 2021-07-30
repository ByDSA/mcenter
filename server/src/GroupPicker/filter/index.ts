/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-cycle */
import { Picker } from "rand-picker";
import { HistoryInterface } from "../../db/models/history";
import { GroupInterface } from "../../db/models/resources/group";
import { ItemGroup } from "../../db/models/resources/group/interface";
import { FuncParams } from "../Params";
import dependent from "./dependent";
import preventRepeatInDays from "./minDaysFromLastTime";
import preventDisabled from "./noDisabled";
import preventRepeatLast from "./noRepeatLast";
import removeWeightLowerOrEqualThan from "./noWeightLowerOrEqual";

const { PICKER_MIN_WEIGHT, PICKER_MIN_DAYS } = process.env;

type MiddlewareFilterFunction = (params: FuncParams)=> boolean;
const filterFunctions: MiddlewareFilterFunction[] = [
  dependent,
  preventDisabled,
  preventRepeatLast,
  removeWeightLowerOrEqualThan(+(PICKER_MIN_WEIGHT ?? -999)),
  preventRepeatInDays(+(PICKER_MIN_DAYS ?? 0)),
];

type FilterParams = {
  picker: Picker<ItemGroup>,
  group: GroupInterface,
  history?: HistoryInterface
};
export default function filter(
  filterParams: FilterParams,
): void {
  const { picker, group } = filterParams;
  const newData = picker.data.filter((self: ItemGroup) => {
    for (const func of filterFunctions) {
      if (!func( {
        ...filterParams,
        self,
      } ))
        return false;
    }

    return true;
  } );

  updatePickerContent(picker, newData);

  putDefaultIfEmpty(picker, group);
}

function updatePickerContent(picker: Picker<ItemGroup>, newData: ItemGroup[]) {
  for (let i = 0; i < picker.data.length; i++) {
    const episode = picker.data[i];

    if (!newData.includes(episode)) {
      picker.remove(episode);
      i--;
    }
  }
}
function putDefaultIfEmpty(picker: Picker<ItemGroup>, group: GroupInterface) {
  if (picker.data.length === 0) {
    const first = (<ItemGroup[]>group.content)[0];

    picker.put(first);
  }
}
