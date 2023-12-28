import { assertIsDefined } from "#shared/utils/validation";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";
import PreventRepeatLastFilter from "./PreventRepeatLastFilter";

const DEFAULT_EPISODE = EPISODES_SIMPSONS[0];
const OTHER_EPISODE = EPISODES_SIMPSONS[1];

assertIsDefined(DEFAULT_EPISODE);
assertIsDefined(OTHER_EPISODE);

describe("PreventRepeatLastFilter", () => {
  it("should return true when last episode is undefined", async () => {
    const filter = new PreventRepeatLastFilter(undefined);
    const result = await filter.filter(DEFAULT_EPISODE);

    expect(result).toBe(true);
  } );

  it("should return true when current episode is different from last episode", async () => {
    const filter = new PreventRepeatLastFilter(OTHER_EPISODE);
    const result = await filter.filter(DEFAULT_EPISODE);

    expect(result).toBe(true);
  } );

  it("should return false when current episode is the same as last episode", async () => {
    const filter = new PreventRepeatLastFilter(DEFAULT_EPISODE);
    const result = await filter.filter(DEFAULT_EPISODE);

    expect(result).toBe(false);
  } );
} );
