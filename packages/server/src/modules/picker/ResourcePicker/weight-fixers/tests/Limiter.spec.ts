import { Pickable } from "#shared/models/resource";
import LimiterWeightFixer from "../Limiter";

type Case = {
  limit: number;
  initialWeight: number;
  expectedWeight: number;
};

const RESOURCE_BASE: Pickable = {
  weight: 123,
};
const cases = [
  {
    limit: 100,
    initialWeight: 101,
    expectedWeight: 100,
  },
  {
    limit: 0,
    initialWeight: 5,
    expectedWeight: 0,
  },
  {
    limit: -1,
    initialWeight: 0,
    expectedWeight: -1,
  },
] as Case[];

describe.each(cases)("limiterWeightFixer", (testCase) => {
  it(`should return ${testCase.expectedWeight} when initialWeight = ${testCase.initialWeight} and limit = ${testCase.limit}`, async () => {
    const weightFixer = new LimiterWeightFixer(testCase.limit);
    const result = await weightFixer.fixWeight( {
      resource: RESOURCE_BASE,
      resources: [],
      currentWeight: testCase.initialWeight,
    } );

    expect(result).toBe(testCase.expectedWeight);
  } );
} );
