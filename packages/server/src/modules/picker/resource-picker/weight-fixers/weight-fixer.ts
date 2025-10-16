type Params<R> = {
  resource: R;
  resources: readonly R[];
  currentWeight: number;
};

export interface WeightFixer<R> {
  fixWeight(params: Params<R>): Promise<number>;
}

export {
  Params as WeightFixerParams,
};
