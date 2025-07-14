import { assertIsSerie, assertIsSerieEntity } from ".";

const VALID_MODEL = {
  id: "1x01",
  name: "name",
};

describe("assertIsModel", () => {
  it("should not throw an error when asserting a valid object", () => {
    const obj = VALID_MODEL;

    expect(() => {
      assertIsSerieEntity(obj);
    } ).not.toThrow();
  } );

  it("should throw an error when asserting an entry object with additional properties", () => {
    const obj = {
      ...VALID_MODEL,
      extraProperty: "extra",
    };

    expect(() => {
      assertIsSerie(obj);
    } ).toThrow();
  } );

  it("should throw an error when asserting an entry object with a missing required property", () => {
    const obj = {
      ...VALID_MODEL,
    };

    // @ts-ignore
    delete obj.name;

    expect(() => {
      assertIsSerie(obj);
    } ).toThrow();
  } );

  describe("domain tests", () => {
    it("should throw an error when asserting a non-object value", () => {
      const NOT_AN_OBJECT = "not an object";

      expect(() => {
        assertIsSerie(NOT_AN_OBJECT);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with an invalid property type", () => {
      const obj = {
        ...VALID_MODEL,
        name: 123,
      };

      expect(() => {
        assertIsSerie(obj);
      } ).toThrow();
    } );
  } );
} );
