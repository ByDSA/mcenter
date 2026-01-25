import { Types } from "mongoose";
import { SerieEntity, serieEntitySchema, serieSchema } from ".";

const VALID_MODEL: SerieEntity = {
  id: new Types.ObjectId().toString(),
  key: "serie",
  name: "Serie Name",
};

describe("assertIsModel", () => {
  it("should not throw an error when asserting a valid object", () => {
    const obj = VALID_MODEL;

    expect(() => {
      serieEntitySchema.parse(obj);
    } ).not.toThrow();
  } );

  it("should throw an error when asserting an entry object with additional properties", () => {
    const obj = {
      ...VALID_MODEL,
      extraProperty: "extra",
    };

    expect(() => {
      serieSchema.parse(obj);
    } ).toThrow();
  } );

  it(
    "should throw an error when asserting an entry object with a missing required property",
    () => {
      const obj = {
        ...VALID_MODEL,
      };

      // @ts-ignore
      delete obj.name;

      expect(() => {
        serieSchema.parse(obj);
      } ).toThrow();
    },
  );

  describe("domain tests", () => {
    it("should throw an error when asserting a non-object value", () => {
      const NOT_AN_OBJECT = "not an object";

      expect(() => {
        serieSchema.parse(NOT_AN_OBJECT);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with an invalid property type", () => {
      const obj = {
        ...VALID_MODEL,
        name: 123,
      };

      expect(() => {
        serieSchema.parse(obj);
      } ).toThrow();
    } );
  } );
} );
