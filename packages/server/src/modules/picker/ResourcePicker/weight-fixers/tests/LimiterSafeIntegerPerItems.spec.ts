import { Pickable } from "#shared/models/resource";
import { LimiterSafeIntegerPerItems } from "..";

type Case = {
  resources: readonly Pickable[];
  initialWeight: number;
  expectedWeight: number;
};

const RESOURCE_BASE: Pickable = {
  weight: 123,
};
const RESOURCES_1000: readonly Pickable[] = Array(1000).fill(RESOURCE_BASE);
const cases = [
  {
    resources: RESOURCES_1000,
    initialWeight: 100,
    expectedWeight: 100,
  },
  {
    resources: RESOURCES_1000,
    initialWeight: 0,
    expectedWeight: 0,
  },
  {
    resources: RESOURCES_1000,
    initialWeight: -1,
    expectedWeight: -1,
  },
  {
    resources: RESOURCES_1000,
    initialWeight: Number.MAX_SAFE_INTEGER,
    expectedWeight: Number.MAX_SAFE_INTEGER / 1000,
  },
  {
    resources: RESOURCES_1000,
    initialWeight: Number.MAX_SAFE_INTEGER + 12345,
    expectedWeight: Number.MAX_SAFE_INTEGER / 1000,
  },
  {
    resources: RESOURCES_1000,
    initialWeight: Infinity,
    expectedWeight: Number.MAX_SAFE_INTEGER / 1000,
  },
  {
    resources: RESOURCES_1000,
    initialWeight: -Infinity,
    expectedWeight: -Infinity,
  },
] as Case[];

describe.each(cases)("LimiterSafeIntegerPerItemsWeightFixer", (testCase) => {
  it(`should return ${testCase.expectedWeight} when initialWeight = ${testCase.initialWeight} and resources length = ${testCase.resources.length}`, async () => {
    const weightFixer = new LimiterSafeIntegerPerItems();
    const result = await weightFixer.fixWeight( {
      resource: RESOURCE_BASE,
      resources: testCase.resources,
      currentWeight: testCase.initialWeight,
    } );

    expect(result).toBe(testCase.expectedWeight);
  } );
} );
