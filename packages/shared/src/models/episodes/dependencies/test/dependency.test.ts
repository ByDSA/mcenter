import { genAssertZod } from "../../../../utils/validation/zod";
import { EpisodeDependency, episodeDependencyEntitySchema } from "../dependency";
import { DEPENDENCY_SIMPSONS } from "./fixtures";

const assertIsEntity: ReturnType<typeof genAssertZod> = genAssertZod(episodeDependencyEntitySchema);
const VALID_MODEL = DEPENDENCY_SIMPSONS;

describe("assertIsEntity", () => {
  it("should not throw an error when asserting a valid object", () => {
    const dependency = VALID_MODEL;

    expect(() => {
      assertIsEntity(dependency);
    } ).not.toThrow();
  } );

  it("should throw an error when asserting an dependency object with additional properties", () => {
    const obj = {
      ...VALID_MODEL,
      extraProperty: "extra",
    };

    expect(() => {
      assertIsEntity(obj);
    } ).toThrow();
  } );

  it(
    "should throw an error when asserting an dependency object with a missing required property",
    () => {
      const obj: EpisodeDependency = {
        ...VALID_MODEL,
      };

      // @ts-ignore
      delete obj.lastCompKey;

      expect(() => {
        assertIsEntity(obj);
      } ).toThrow();
    },
  );

  describe("domain tests", () => {
    it("should throw an error when asserting a non-object value", () => {
      const obj = "not an object";

      expect(() => {
        assertIsEntity(obj);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with an invalid property type", () => {
      const obj = {
        ...VALID_MODEL,
        episodeId: 123,
      };

      expect(() => {
        assertIsEntity(obj);
      } ).toThrow();
    } );
  } );
} );
