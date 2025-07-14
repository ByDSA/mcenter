import { NotFoundException } from "@nestjs/common";
import { definedEntries, expectErrorStackStartsWithThisFilename, undefinedEntries } from "$sharedSrc/utils/tests";
import { assertFound } from "./found";

describe("assertFound", () => {
  describe.each(definedEntries)("when value is defined", (entry) => {
    it(`does not throw anything for ${entry.description}`, () => {
      expect(() => {
        assertFound(entry.value);
      } ).not.toThrow();
    } );
  } );

  describe.each(undefinedEntries)("when value is undefined", (entry) => {
    it(`throws NotFoundException for ${entry.description}`, () => {
      expect(() => {
        assertFound(entry.value);
      } ).toThrow(NotFoundException);
    } );
  } );

  it("error stack in this file", () => {
    try {
      assertFound(undefined);

      expect(true).toBeFalsy(); // No debería ejecutarse
    } catch (e) {
      expectErrorStackStartsWithThisFilename(e as NotFoundException);
    }
  } );
} );
