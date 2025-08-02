import { SECONDS_IN_DAY } from "#modules/resources";
import { Resource } from "#modules/resources/models";
import { genLastTimePlayedAgo, genLastTimePlayedDaysAgo } from "#modules/resources/tests";
import { useFakeTime } from "#tests/time";
import { Fx, LastTimeWeightFixer } from "../LastTime";
import { secondsElapsedFrom } from "../../utils";
import { fixtureEpisodes } from "#episodes/tests";

useFakeTime(); // Por la diferencia de Date.now durante la ejecución

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
const fx: Fx<Resource> = (r: Resource, x: number) => {
  if (r.lastTimePlayed === undefined)
    return Infinity;

  return x;
};
const fxDays: Fx<Resource> = (_: Resource, x: number) => Math.round(x / SECONDS_IN_DAY);

type Case = {
  resource: Resource;
  resources: readonly Resource[];
  fx: Fx<Resource>;
  initialWeight: number;
  expectedWeight: number;
};

const RESOURCE_NEVER: Resource = {
  ...EPISODES_SIMPSONS[0],
};

delete RESOURCE_NEVER.lastTimePlayed;
const RESOURCE_THREE_DAYS_AGO: Resource = {
  ...RESOURCE_NEVER,
  lastTimePlayed: genLastTimePlayedDaysAgo(3),
};
const RESOURCE_TWO_SECONDS_AGO: Resource = {
  ...RESOURCE_NEVER,
  lastTimePlayed: genLastTimePlayedAgo(2),
};
const RESOURCE_RIGHT_NOW: Resource = {
  ...RESOURCE_NEVER,
  lastTimePlayed: genLastTimePlayedAgo(),
};
const RESOURCE_TWO_SECONDS_IN_THE_FUTURE: Resource = {
  ...RESOURCE_NEVER,
  lastTimePlayed: genLastTimePlayedAgo(-2),
};
const RESOURCES = Object.freeze([
  RESOURCE_NEVER,
  RESOURCE_THREE_DAYS_AGO,
  RESOURCE_TWO_SECONDS_AGO,
  RESOURCE_RIGHT_NOW,
] as const);
const cases = [
  {
    resource: RESOURCE_NEVER,
    resources: RESOURCES,
    fx,
    initialWeight: 1,
    expectedWeight: Infinity,
  },
  {
    resource: RESOURCE_TWO_SECONDS_AGO,
    resources: RESOURCES,
    fx,
    initialWeight: 1,
    expectedWeight: 2,
  },
  {
    resource: RESOURCE_THREE_DAYS_AGO,
    resources: RESOURCES,
    fx,
    initialWeight: 1,
    expectedWeight: 3 * SECONDS_IN_DAY,
  },
  {
    resource: RESOURCE_THREE_DAYS_AGO,
    resources: RESOURCES,
    fx: fxDays,
    initialWeight: 1,
    expectedWeight: 3,
  },
  {
    resource: RESOURCE_RIGHT_NOW,
    resources: RESOURCES,
    fx,
    initialWeight: 1,
    expectedWeight: 0,
  },
  {
    resource: RESOURCE_RIGHT_NOW,
    resources: RESOURCES,
    fx: fxDays,
    initialWeight: 1,
    expectedWeight: 0,
  },
  {
    resource: RESOURCE_TWO_SECONDS_IN_THE_FUTURE,
    resources: RESOURCES,
    fx,
    initialWeight: 1,
    expectedWeight: 0,
  },
  {
    resource: RESOURCE_TWO_SECONDS_IN_THE_FUTURE,
    resources: RESOURCES,
    fx: fxDays,
    initialWeight: 1,
    expectedWeight: 0,
  },
] as Case[];

describe.each(cases)("lastTimeWeightFixer", (testCase) => {
  const elapsed = secondsElapsedFrom(testCase.resource.lastTimePlayed ?? 0);

  it(`should return ${testCase.expectedWeight} when initialWeight = ${testCase.initialWeight}, \
    seconds ago = ${elapsed} and fx=${testCase.fx === fxDays ? "fxDays" : "fx"}`, async () => {
    const weightFixer = new LastTimeWeightFixer( {
      fx: testCase.fx,
    } );
    const result = await weightFixer.fixWeight( {
      resource: testCase.resource,
      resources: testCase.resources,
      currentWeight: testCase.initialWeight,
    } );

    expect(result).toBe(testCase.expectedWeight);
  } );
} );
