import { CustomErrorParams } from "zod";

export type RefinementWithMessage<T> = [
  (val: T)=> boolean,
  CustomErrorParams | string | ((arg: T)=> CustomErrorParams)
];

/* eslint-disable import/prefer-default-export */
export const AtLeastOneDefinedRefinement: RefinementWithMessage<Record<number | string | symbol, unknown>> = [
  (obj) => {
    const values = Object.values(obj);

    return values.length > 0 && values.some(v => v !== undefined);
  },
  "At least one property must be defined",
];