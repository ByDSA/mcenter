import { definedEntries, expectErrorStackStartsWithThisFilename, undefinedEntries } from "#utils/tests";
import { NotFoundError, assertFound } from "./found";

describe("assertFound", () => {
  describe.each(definedEntries)("when value is defined", (entry) => {
    it(`does not throw anything for ${entry.description}`, () => {
      expect(() => {
        assertFound(entry.value);
      } ).not.toThrow();
    } );
  } );

  describe.each(undefinedEntries)("when value is undefined", (entry) => {
    it(`throws NotFoundError for ${entry.description}`, () => {
      expect(() => {
        assertFound(entry.value);
      } ).toThrow(NotFoundError);
    } );
  } );

  it("error stack in this file", () => {
    try {
      assertFound(undefined);
    } catch (e) {
      expectErrorStackStartsWithThisFilename(e as NotFoundError);
    }
  } );
} );