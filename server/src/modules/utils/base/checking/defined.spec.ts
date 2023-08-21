import { isDefined } from "./defined";

describe("isDefined", () => {
  const definedValues = [0, 1, "", "a", false, true, [], {
  // eslint-disable-next-line no-empty-function
  }, () => { }, new Date(), /(?:)/, new Map(), new Set()];
  const undefinedValues = [undefined, null];

  describe.each(definedValues)("when value is defined", (value) => {
    it(`returns true for ${typeof value }: ${ value.toString()}`, () => {
      expect(isDefined(value)).toBe(true);
    } );
  } );

  describe.each(undefinedValues)("when value is undefined", (value) => {
    it(`returns false for ${typeof value}`, () => {
      expect(isDefined(value)).toBe(false);
    } );
  } );
} );