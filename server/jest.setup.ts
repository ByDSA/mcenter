import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { existsSync } from "node:fs";
import { isDebugging } from "./src/utils/vscode";

if (!isDebugging()) {
  global.console.log = jest.fn(); // Mockear console.log
  global.console.error = jest.fn(); // Mockear console.error
}

const envFilePath = "tests/.env";

if (!existsSync(envFilePath))
  throw new Error(`File ${envFilePath} does not exist`);

dotenv.config( {
  path: envFilePath,
} );

mongoose.set("bufferCommands", false); // Para que lance error si no hay una conexión a la DB
mongoose.set("autoCreate", false); // disable `autoCreate` since `bufferCommands` is false, value)