import { Types } from "mongoose";
import { SeriesEntity, seriesEntitySchema, seriesSchema } from "../serie";

const VALID_MODEL: SeriesEntity = {
  id: new Types.ObjectId().toString(),
  key: "serie",
  name: "Serie Name",
  imageCoverId: null,
  addedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  releasedOn: "2000",
};

describe("assertIsModel", () => {
  it("should not throw an error when asserting a valid object", () => {
    const obj = VALID_MODEL;

    expect(() => {
      seriesEntitySchema.parse(obj);
    } ).not.toThrow();
  } );

  it("should throw an error when asserting an entry object with additional properties", () => {
    const obj = {
      ...VALID_MODEL,
      extraProperty: "extra",
    };

    expect(() => {
      seriesSchema.parse(obj);
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
        seriesSchema.parse(obj);
      } ).toThrow();
    },
  );

  describe("domain tests", () => {
    it("should throw an error when asserting a non-object value", () => {
      const NOT_AN_OBJECT = "not an object";

      expect(() => {
        seriesSchema.parse(NOT_AN_OBJECT);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with an invalid property type", () => {
      const obj = {
        ...VALID_MODEL,
        name: 123,
      };

      expect(() => {
        seriesSchema.parse(obj);
      } ).toThrow();
    } );
  } );
} );
