import { SECONDS_IN_DAY } from "#modules/resources";
import { genLastTimePlayedAgo, genLastTimePlayedDaysAgo } from "#modules/resources/tests";
import { useFakeTime } from "#tests/time";
import { fixtureEpisodes } from "#episodes/tests";
import { Fx, LastTimeWeightFixer } from "../last-time";
import { secondsElapsedFrom } from "../../utils";
import { ResourceWithUserInfo } from "../../filters/tests/types";

class LastTimeResourceWeightFixer extends LastTimeWeightFixer<ResourceWithUserInfo> {
  getLastTimePlayed(r: ResourceWithUserInfo): number {
    return r.userInfo.lastTimePlayed ?? 0;
  }
}

useFakeTime(); // Por la diferencia de Date.now durante la ejecución

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;
const fx: Fx<ResourceWithUserInfo> = (r: ResourceWithUserInfo, x: number) => {
  if (r.userInfo.lastTimePlayed === undefined)
    return Infinity;

  return x;
};
const fxDays: Fx<ResourceWithUserInfo> = (
  _: ResourceWithUserInfo,
  x: number,
) => Math.round(x / SECONDS_IN_DAY);

type Case = {
  resource: ResourceWithUserInfo;
  resources: readonly ResourceWithUserInfo[];
  fx: Fx<ResourceWithUserInfo>;
  initialWeight: number;
  expectedWeight: number;
};

const RESOURCE_NEVER: ResourceWithUserInfo = {
  ...EPISODES_SIMPSONS[0],
  userInfo: {
    lastTimePlayed: 0,
  },
};
const RESOURCE_THREE_DAYS_AGO: ResourceWithUserInfo = {
  ...RESOURCE_NEVER,
  userInfo: {
    lastTimePlayed: genLastTimePlayedDaysAgo(3),
  },
};
const RESOURCE_TWO_SECONDS_AGO: ResourceWithUserInfo = {
  ...RESOURCE_NEVER,
  userInfo: {
    lastTimePlayed: genLastTimePlayedAgo(2),
  },
};
const RESOURCE_RIGHT_NOW: ResourceWithUserInfo = {
  ...RESOURCE_NEVER,
  userInfo: {
    lastTimePlayed: genLastTimePlayedAgo(),
  },
};
const RESOURCE_TWO_SECONDS_IN_THE_FUTURE: ResourceWithUserInfo = {
  ...RESOURCE_NEVER,
  userInfo: {
    lastTimePlayed: genLastTimePlayedAgo(-2),
  },
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
  const elapsed = secondsElapsedFrom(testCase.resource.userInfo.lastTimePlayed ?? 0);

  it(`should return ${testCase.expectedWeight} when initialWeight = ${testCase.initialWeight}, \
    seconds ago = ${elapsed} and fx=${testCase.fx === fxDays ? "fxDays" : "fx"}`, async () => {
    const weightFixer = new LastTimeResourceWeightFixer( {
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
