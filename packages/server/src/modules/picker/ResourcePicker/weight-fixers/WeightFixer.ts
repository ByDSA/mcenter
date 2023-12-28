import { Pickable } from "#shared/models/resource";

type Params<R extends Pickable = Pickable> = {
  resource: R;
  currentWeight: number;
};

export default interface WeightFixer<R extends Pickable = Pickable> {
  fixWeight(params: Params<R>): Promise<number>;
}

export {
  Params as WeightFixerParams
};

