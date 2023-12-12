import path from "path";
import findAllSeriesTreeAt from "./find";

let MEDIA_FOLDER_PATH: string;

beforeAll(() => {
  MEDIA_FOLDER_PATH = process.env.MEDIA_FOLDER_PATH as string;
} );

it("should read all episodes correctly", () => {
  const actual = findAllSeriesTreeAt(path.join(MEDIA_FOLDER_PATH, "series"));

  expect(actual.errors).toHaveLength(0);
} );