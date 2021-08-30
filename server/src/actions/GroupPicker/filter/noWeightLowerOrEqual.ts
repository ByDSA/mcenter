import { FuncParams } from "../Params";

export default function removeWeightLowerOrEqualThan(num: number) {
  return ( { self }: FuncParams): boolean => (self.weight ?? 1) > num;
}
