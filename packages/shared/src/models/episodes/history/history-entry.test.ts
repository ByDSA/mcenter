import { genAssertZod } from "../../../utils/validation/zod";
import { EpisodeHistoryEntry, episodeHistoryEntrySchema } from "./history-entry";

const assertIsModel: ReturnType<typeof genAssertZod> = genAssertZod(episodeHistoryEntrySchema);
const VALID_MODEL: EpisodeHistoryEntry = {
  episodeCompKey: {
    episodeKey: "1x01",
    seriesKey: "serie",
  },
  date: {
    year: 2021,
    month: 1,
    day: 1,
    timestamp: 1234567890,
  },
  streamId: "streamId",
};

describe("assertIsModel", () => {
  it("should not throw an error when asserting a valid object", () => {
    const entry = VALID_MODEL;

    expect(() => {
      assertIsModel(entry);
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

  it(
    "should throw an error when asserting an entry object with a missing required property",
    () => {
      const obj = {
        ...VALID_MODEL,
      };

      // @ts-ignore
      delete obj.episodeCompKey;

      expect(() => {
        assertIsModel(obj);
      } ).toThrow();
    },
  );

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
        episodeId: 123,
      };

      expect(() => {
        assertIsModel(obj);
      } ).toThrow();
    } );
  } );
} );
