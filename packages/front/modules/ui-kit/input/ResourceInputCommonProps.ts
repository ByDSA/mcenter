import { JSX } from "react";

export type ResourceState<R> = readonly [R, React.Dispatch<React.SetStateAction<R>>];

type CalcUpdatedResource<R, V> = (newValue: V, oldResource: R)=> R;

export function getAndUpdateResourceByProp<R, V>(
  prop: string,
): Pick<ResourceInputCommonProps<R, V>, "getValue" | "name" | "setResource"> {
  return {
    setResource: (v, r) => ( {
      ...r,
      [prop]: v,
    } ),
    getValue: (r)=>r[prop],
    name: prop,
  };
}

export type ResourceInputCommonProps<R, V> = {
  resourceState: ResourceState<R>;
  setResource: CalcUpdatedResource<R, V>;
  getValue: (resource: R)=> V;
  isOptional?: boolean;
  error?: string;
  name: string;
  caption?: JSX.Element | string;
};
