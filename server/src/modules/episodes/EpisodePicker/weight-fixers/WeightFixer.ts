import { Resource } from "#modules/utils/resource";

type Params<R extends Resource> = {
  resource: R;
  currentWeight: number;
};

export default interface WeightFixer<R extends Resource> {
  fixWeight(params: Params<R>): Promise<number>;
}

export {
  Params as WeightFixerParams,
};
