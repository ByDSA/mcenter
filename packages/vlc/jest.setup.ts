import { existsSync } from "node:fs";
import * as dotenv from "dotenv";

import { isDebugging } from "../shared/src/utils/vscode";

if (!isDebugging()) {
  global.console.log = jest.fn(); // Mockear console.log
  global.console.error = jest.fn(); // Mockear console.error
  global.console.warn = jest.fn(); // Mockear console.warn
}

const ENV_FILE_PATH = "tests/.env";

if (!existsSync(ENV_FILE_PATH))
  console.log(`File ${ENV_FILE_PATH} does not exist`);
else {
  dotenv.config( {
    path: ENV_FILE_PATH,
  } );
}
