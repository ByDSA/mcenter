import { ResourceVO } from "#shared/models/resource";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import PreventRepeatInDaysFilter, { SECONDS_IN_DAY } from "../PreventRepeatInDaysFilter";

function genLastTimePlayedDaysAgo(days: number) {
  return Date.now() / 1000 - (days * SECONDS_IN_DAY);
}
const EP_BASE: ResourceVO = {
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
    minDays: 2.99,
    expected: true,
  },
  {
    lastTimePlayedDaysAgo: 3,
    minDays: 3.01,
    expected: false,
  },
] as CaseDaysAgo[];

describe.each(casesDaysAgo)("PreventRepeatInDaysFilter", (testCase) => {
  it(`should return ${testCase.expected} when lastTimePlayedDaysAgo = ${testCase.lastTimePlayedDaysAgo} days ago and minDays = ${testCase.minDays}`, async () => {
    const params = {
      minDays: testCase.minDays,
    };
    const filter = new PreventRepeatInDaysFilter(params);
    const result = await filter.filter( {
      ...EP_BASE,
      lastTimePlayed: genLastTimePlayedDaysAgo(testCase.lastTimePlayedDaysAgo),
    } );

    expect(result).toBe(testCase.expected);
  } );
} );

type CaseLastTimePlayed = {
  lastTimePlayed: number | undefined;
  minDays: number;
  expected: boolean;
};

const casesLastTimePlayed = [
  {
    lastTimePlayed: 0,
    minDays: Number.MAX_SAFE_INTEGER,
    expected: true,
  },
  {
    lastTimePlayed: -1,
    minDays: Number.MAX_SAFE_INTEGER,
    expected: true,
  },
  {
    lastTimePlayed: undefined,
    minDays: Number.MAX_SAFE_INTEGER,
    expected: true,
  },
  {
    lastTimePlayed: 1,
    minDays: Number.MAX_SAFE_INTEGER,
    expected: false,
  },
] as CaseLastTimePlayed[];

describe.each(casesLastTimePlayed)("PreventRepeatInDaysFilter", (testCase) => {
  it(`should return ${testCase.expected} when lastTimePlayed = ${testCase.lastTimePlayed} and minDays = ${testCase.minDays}`, async () => {
    const params = {
      minDays: testCase.minDays,
    };
    const filter = new PreventRepeatInDaysFilter(params);
    const result = await filter.filter( {
      ...EP_BASE,
      lastTimePlayed: testCase.lastTimePlayed,
    } );

    expect(result).toBe(testCase.expected);
  } );
} );