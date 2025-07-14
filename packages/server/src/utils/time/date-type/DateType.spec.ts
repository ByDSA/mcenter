import { DateType, assertIsDateType } from "$shared/utils/time";

const assertIsModel: typeof assertIsDateType = assertIsDateType;
const MODEL_VALID: DateType = {
  year: 2021,
  month: 1,
  day: 1,
  timestamp: 1234567890,
};

describe("assert", () => {
  it("should not throw an error when asserting a valid object", () => {
    const model = MODEL_VALID;

    expect(() => {
      assertIsModel(model);
    } ).not.toThrow();
  } );

  it("should throw an error when asserting an object with additional properties", () => {
    const entry = {
      ...MODEL_VALID,
      extraProperty: "extra",
    };

    expect(() => {
      assertIsModel(entry);
    } ).toThrow();
  } );

  it("should throw an error when asserting an entry object with a missing required property", () => {
    const entry = {
      ...MODEL_VALID,
    };

    // @ts-ignore
    delete entry.day;

    expect(() => {
      assertIsModel(entry);
    } ).toThrow();
  } );

  describe("domain tests", () => {
    it("should throw an error when asserting a non-object value", () => {
      const entry = "not an object";

      expect(() => {
        assertIsModel(entry);
      } ).toThrow();
    } );

    it("should throw an error when asserting an entry object with an invalid property type", () => {
      const entry = {
        ...MODEL_VALID,
        day: "1",
      };

      expect(() => {
        assertIsModel(entry);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with invalid day=0", () => {
      const entry = {
        ...MODEL_VALID,
        day: 0,
      };

      expect(() => {
        assertIsModel(entry);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with invalid day=32", () => {
      const entry = {
        ...MODEL_VALID,
        day: 32,
      };

      expect(() => {
        assertIsModel(entry);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with invalid month=0", () => {
      const entry = {
        ...MODEL_VALID,
        month: 0,
      };

      expect(() => {
        assertIsModel(entry);
      } ).toThrow();
    } );

    it("should throw an error when asserting an object with invalid month=13", () => {
      const entry = {
        ...MODEL_VALID,
        month: 13,
      };

      expect(() => {
        assertIsModel(entry);
      } ).toThrow();
    } );
  } );
} );
