import * as dotenv from "dotenv";
import { existsSync } from "node:fs";
// eslint-disable-next-line import/no-relative-packages
import { isDebugging } from "../shared/src/utils/vscode";

if (!isDebugging()) {
  global.console.log = jest.fn(); // Mockear console.log
  global.console.error = jest.fn(); // Mockear console.error
  global.console.warn = jest.fn(); // Mockear console.warn
}

const envFilePath = "tests/.env";

if (!existsSync(envFilePath))
  console.log(`File ${envFilePath} does not exist`);
else {
  dotenv.config( {
    path: envFilePath,
  } );
}