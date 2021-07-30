/* eslint-disable require-await */
import { FuncParams, Params } from "../Params";
import weightInitial from "./initial";
import weightLimiter from "./limiter";
import weightTag from "./tag";

type MiddlewareWeightFunction = (params: FuncParams)=> Promise<number>;
const middlewareWeightFunctions: MiddlewareWeightFunction[] = [
  weightInitial,
  weightTag,
  weightLimiter,
];

export default async function fixWeight(
  { picker, group, history }: Params,
): Promise<void> {
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
