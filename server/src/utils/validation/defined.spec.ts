import { definedEntries, undefinedEntries } from "#tests/values";
import { expectErrorStackStartsWithThisFilename } from "#utils/errors/test";
import { NotDefinedError, assertIsDefined, isDefined } from "./defined";

describe("isDefined", () => {
  describe.each(definedEntries)("when value is defined", (entry) => {
    it(`returns true for ${entry.description} value`, () => {
      expect(isDefined(entry.value)).toBe(true);
    } );
  } );

  describe.each(undefinedEntries)("when value is undefined", (entry) => {
    it(`returns false for ${entry.description}`, () => {
      expect(isDefined(entry.value)).toBe(false);
    } );
  } );
} );

describe("assertIsDefined", () => {
  describe.each(definedEntries)("when value is defined", (entry) => {
    it(`does not throw anything for ${entry.description}:`, () => {
      expect(() => {
        assertIsDefined(entry.value);
      } ).not.toThrow();
    } );
  } );

  describe.each(undefinedEntries)("when value is undefined", (record) => {
    it(`throws NotDefinedError for ${record.description}`, () => {
      expect(() => {
        assertIsDefined(record.value);
      } ).toThrow(NotDefinedError);
    } );
  } );

  it("error stack in this file", () => {
    try {
      assertIsDefined(undefined);
    } catch (e) {
      expectErrorStackStartsWithThisFilename(e as NotDefinedError);
    }
  } );
} );