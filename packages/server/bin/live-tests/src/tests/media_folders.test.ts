import * as fs from "node:fs";
import * as path from "node:path";
import { serverEnvs } from "../envs";

it("Exists media folder", () => {
  const actual = fs.existsSync(serverEnvs.MEDIA_FOLDER_PATH);

  expect(actual).toBeTruthy();
} );

it("Exists simpsons folder", () => {
  const folder = path.join(serverEnvs.MEDIA_FOLDER_PATH, "series", "simpsons");
  const actual = fs.existsSync(folder);

  expect(actual).toBeTruthy();
} );