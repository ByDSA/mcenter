import { SECONDS_IN_DAY } from "#modules/resources";
import { genLastTimePlayedDaysAgo } from "#modules/resources/tests";
import { useFakeTime } from "#tests/time";
import { fixtureEpisodes } from "#episodes/tests";
import { PreventRepeatInDaysFilter } from "../prevent-repeat-in-days-filter";
import { ResourceWithUserInfo } from "./types";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

class PreventRepeatInDaysResourceFilter extends PreventRepeatInDaysFilter<ResourceWithUserInfo> {
  getLastTimePlayed(r: ResourceWithUserInfo) {
    return r.userInfo.lastTimePlayed ?? 0;
  }
}

useFakeTime(); // Por la diferencia de Date.now durante la ejecución

const EP_BASE: ResourceWithUserInfo = {
  ...EPISODES_SIMPSONS[0],
  userInfo: {
    lastTimePlayed: 0,
  },
};

type CaseDaysAgo = {
  lastTimePlayedDaysAgo: number;
  minDays: number;
  expected: boolean;
};

const casesDaysAgo = [
  {
    lastTimePlayedDaysAgo: 3,
    minDays: 2,
    expected: true,
  },
  {
    lastTimePlayedDaysAgo: 3,
    minDays: 3,
    expected: true,
  },
  {
    lastTimePlayedDaysAgo: 3,
    minDays: 3 + (1 / SECONDS_IN_DAY),
    expected: false,
  },
] as CaseDaysAgo[];

describe.each(casesDaysAgo)("preventRepeatInDaysFilter", (testCase) => {
  it(
    `should return ${testCase.expected} when lastTimePlayedDaysAgo = \
${testCase.lastTimePlayedDaysAgo} days ago and minDays = ${testCase.minDays}`,
    async () => {
      const params = {
        minDays: testCase.minDays,
      };
      const filter = new PreventRepeatInDaysResourceFilter(params);
      const result = await filter.filter( {
        ...EP_BASE,
        userInfo: {
          ...EP_BASE.userInfo,
          lastTimePlayed: genLastTimePlayedDaysAgo(testCase.lastTimePlayedDaysAgo),
        },
      } );

      expect(result).toBe(testCase.expected);
    },
  );
} );

type CaseLastTimePlayed = {
  lastTimePlayed: number | undefined;
  minDays: number;
  expected: boolean;
};

const casesLastTimePlayed = [
  {
    lastTimePlayed: 0,
    minDays: Infinity,
    expected: true,
  },
  {
    lastTimePlayed: -1,
    minDays: Infinity,
    expected: true,
  },
  {
    lastTimePlayed: undefined,
    minDays: Infinity,
    expected: true,
  },
  {
    lastTimePlayed: 1,
    minDays: Infinity,
    expected: false,
  },
] as CaseLastTimePlayed[];

describe.each(casesLastTimePlayed)("preventRepeatInDaysFilter", (testCase) => {
  it(
    `should return ${testCase.expected} when lastTimePlayed =
    ${testCase.lastTimePlayed} and minDays = ${testCase.minDays}`,
    async () => {
      const params = {
        minDays: testCase.minDays,
      };
      const filter = new PreventRepeatInDaysResourceFilter(params);
      const result = await filter.filter( {
        ...EP_BASE,
        userInfo: {
          ...EP_BASE.userInfo,
          lastTimePlayed: testCase.lastTimePlayed ?? 0,
        },
      } );

      expect(result).toBe(testCase.expected);
    },
  );
} );
