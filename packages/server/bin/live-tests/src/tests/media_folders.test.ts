import * as fs from "node:fs";
import * as path from "node:path";
import { projectEnvs } from "../envs";

it("Exists media folder", () => {
  const actual = fs.existsSync(projectEnvs.MCENTER_SERVER_MEDIA_PATH);

  expect(actual).toBeTruthy();
} );

it("Exists simpsons folder", () => {
  const folder = path.join(projectEnvs.MCENTER_SERVER_MEDIA_PATH, "series", "simpsons");
  const actual = fs.existsSync(folder);

  expect(actual).toBeTruthy();
} );