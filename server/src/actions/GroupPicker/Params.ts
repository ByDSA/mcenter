import { HistoryInterface } from "@models/history";
import { GroupInterface } from "@models/resources/group";
import { ItemGroup } from "@models/resources/group/interface";
import { Picker } from "rand-picker";

export type Params = {
  picker: Picker<ItemGroup>,
  group: GroupInterface,
  history?: HistoryInterface,
};

export type FuncParams = Params & {
  self: ItemGroup,
};
