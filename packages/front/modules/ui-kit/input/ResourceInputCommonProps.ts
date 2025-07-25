import type { AddOnReset } from "#modules/utils/resources/useCrud";
import { JSX } from "react";

export type ResourceState<R> = readonly [R, React.Dispatch<React.SetStateAction<R>>];

type CalcUpdatedResource<R, V> = (newValue: V, oldResource: R)=> R;

export function getAndUpdateResourceByProp<R, V>(
  prop: string,
): Pick<ResourceInputCommonProps<R, V>, "getUpdatedResource" | "getValue" | "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      [prop]: v,
    } ),
    getValue: (r)=>r[prop],
    name: prop,
  };
}

export type ResourceInputCommonProps<R, V> = {
  resourceState: ResourceState<R>;
  getUpdatedResource: CalcUpdatedResource<R, V>;
  getValue: (resource: R)=> V;
  addOnReset: AddOnReset<R>;
  isOptional?: boolean;
  error?: string;
  name: string;
  caption?: JSX.Element | string;
  isHidden?: boolean;
};
