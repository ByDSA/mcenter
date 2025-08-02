import { SECONDS_IN_DAY } from "#modules/resources";
import { Resource } from "#modules/resources/models";
import { genLastTimePlayedDaysAgo } from "#modules/resources/tests";
import { useFakeTime } from "#tests/time";
import { PreventRepeatInDaysFilter } from "../prevent-repeat-in-days-filter";
import { fixtureEpisodes } from "#episodes/tests";

const EPISODES_SIMPSONS = fixtureEpisodes.Simpsons.List;

useFakeTime(); // Por la diferencia de Date.now durante la ejecución

const EP_BASE: Resource = {
  ...EPISODES_SIMPSONS[0],
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
      const filter = new PreventRepeatInDaysFilter(params);
      const result = await filter.filter( {
        ...EP_BASE,
        lastTimePlayed: genLastTimePlayedDaysAgo(testCase.lastTimePlayedDaysAgo),
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
      const filter = new PreventRepeatInDaysFilter(params);
      const result = await filter.filter( {
        ...EP_BASE,
        lastTimePlayed: testCase.lastTimePlayed,
      } );

      expect(result).toBe(testCase.expected);
    },
  );
} );
