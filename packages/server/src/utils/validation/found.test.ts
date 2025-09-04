import { InternalServerErrorException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { definedEntries, expectErrorStackStartsWithThisFilename, undefinedEntries } from "$sharedSrc/utils/tests";
import { assertFoundClient, assertFoundServer } from "./found";

describe("assertFound", () => {
  describe.each(definedEntries)("when value is defined", (entry) => {
    it(`does not throw anything for ${entry.description}`, () => {
      expect(() => {
        assertFoundClient(entry.value);
      } ).not.toThrow();
    } );
  } );

  describe.each(undefinedEntries)("when value is undefined", (entry) => {
    it(`throws UnprocessableEntityException for ${entry.description}`, () => {
      expect(() => {
        assertFoundClient(entry.value);
      } ).toThrow(UnprocessableEntityException);
    } );
  } );

  describe.each(undefinedEntries)("when value is undefined", (entry) => {
    it(`throws InternalServerErrorException for ${entry.description}`, () => {
      expect(() => {
        assertFoundServer(entry.value);
      } ).toThrow(InternalServerErrorException);
    } );
  } );

  it("error stack in this file", () => {
    try {
      assertFoundClient(undefined);

      expect(true).toBeFalsy(); // No debería ejecutarse
    } catch (e) {
      expectErrorStackStartsWithThisFilename(e as NotFoundException);
    }
  } );
} );
