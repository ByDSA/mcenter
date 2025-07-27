import path from "node:path";
import { findAllSerieFolderTreesAt } from "./find";

let MEDIA_FOLDER_PATH: string;

beforeAll(() => {
  MEDIA_FOLDER_PATH = process.env.MEDIA_FOLDER_PATH as string;
} );

it("should read all episodes correctly", () => {
  const seriesPath = path.join(MEDIA_FOLDER_PATH, "series");

  expect(() => {
    findAllSerieFolderTreesAt(seriesPath);
  } ).not.toThrow();
} );
