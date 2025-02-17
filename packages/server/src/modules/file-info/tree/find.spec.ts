import path from "node:path";
import { findAllSerieFolderTreesAt } from "./find";

let MEDIA_FOLDER_PATH: string;

beforeAll(() => {
  MEDIA_FOLDER_PATH = process.env.MEDIA_FOLDER_PATH as string;
} );

it("should read all episodes correctly", () => {
  const actual = findAllSerieFolderTreesAt(path.join(MEDIA_FOLDER_PATH, "series"));

  expect(actual.errors).toHaveLength(0);
} );
