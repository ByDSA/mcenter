import * as dotenv from "dotenv";
import { existsSync } from "node:fs";

// global.console.log = jest.fn(); // Mockear console.log
global.console.error = jest.fn(); // Mockear console.error

const envFilePath = "tests/.env";

if (!existsSync(envFilePath))
  throw new Error(`File ${envFilePath} does not exist`);

dotenv.config( {
  path: envFilePath,
} );