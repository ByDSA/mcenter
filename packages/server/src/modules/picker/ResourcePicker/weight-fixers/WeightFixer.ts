import { Pickable } from "#modules/resources/models";

type Params<R extends Pickable = Pickable> = {
  resource: R;
  resources: readonly R[];
  currentWeight: number;
};

export interface WeightFixer<R extends Pickable = Pickable> {
  fixWeight(params: Params<R>): Promise<number>;
}

export {
  Params as WeightFixerParams,
};
