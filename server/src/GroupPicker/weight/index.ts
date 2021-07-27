/* eslint-disable require-await */
import { Picker } from "rand-picker";
import { GroupInterface } from "../../db/models/group";
import { ItemGroup } from "../../db/models/group/interface";
import { HistoryInterface } from "../../db/models/history";
import { Params } from "../GroupPicker";
import weightInitial from "./initial";
import weightLimiter from "./limiter";
import weightTag from "./tag";

type MiddlewareWeightFunction = (params: Params)=> Promise<number>;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
  weightInitial,
  weightTag,
  weightLimiter,
];

export default async function fixWeight(
  picker: Picker<ItemGroup>,
  group: GroupInterface,
  history: HistoryInterface,
): Promise<void> {
  console.log("Fixing weight...");

  for (const self of picker.data) {
    for (const func of middlewareWeightFunctions) {
      // eslint-disable-next-line no-await-in-loop
      const newWeight = await func( {
        self,
        picker,
        group,
        history,
      } );

      self.weight = newWeight;
      picker.put(self, newWeight);
    }
  }
}
