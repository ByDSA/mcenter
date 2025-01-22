import { assertIsModel } from "./models";

describe("assertIsModel", () => {
  const VALID_MODEL = {
    id: "1x01",
    name: "name",
  };

  it("should not throw an error when asserting a valid object", () => {
    const obj = VALID_MODEL;

    expect(() => {
      assertIsModel(obj);
    } ).not.toThrow();
  } );

  it("should throw an error when asserting an entry object with additional properties", () => {
    const obj = {
      ...VALID_MODEL,
      extraProperty: "extra",
    };

    expect(() => {
      assertIsModel(obj);
    } ).toThrow();
  } );

  it("should throw an error when asserting an entry object with a missing required property", () => {
    const obj = {
      ...VALID_MODEL,
    };

    // @ts-ignore
    delete obj.name;

    expect(() => {
      assertIsModel(obj);
    } ).toThrow();
  } );

  describe("domain tests", () => {
    it("should throw an error when asserting a non-object value", () => {
      const obj = "not an object";

      expect(() => {
        assertIsModel(obj);
      } ).toThrow();
    } );
    it("should throw an error when asserting an object with an invalid property type", () => {
      const obj = {
        ...VALID_MODEL,
        name: 123,
      };

      expect(() => {
        assertIsModel(obj);
      } ).toThrow();
    } );
  } );
} );
