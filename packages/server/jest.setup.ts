import "reflect-metadata";

import * as path from "node:path";
import { existsSync } from "node:fs";
import { glob } from "glob";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { isDebugging } from "../shared/src/utils/vscode";

if (process.env.NODE_ENV === "test")
  process.setMaxListeners(20);

function loadEnvsFile(p: string): void {
  if (!existsSync(p))
    throw new Error(`File ${p} does not exist`);

  dotenv.config( {
    path: p,
    override: true,
  } );
}

if (!isDebugging()) {
  global.console.log = jest.fn(); // Mockear console.log
  global.console.info = jest.fn(); // Mockear console.info
  global.console.debug = jest.fn(); // Mockear console.debug
  global.console.trace = jest.fn(); // Mockear console.trace
  global.console.warn = jest.fn(); // Mockear console.warn
  global.console.error = jest.fn(); // Mockear console.error
}

loadEnvsFile(".env.dev");
loadEnvsFile("tests/.env");

mongoose.set("bufferCommands", false); // Para que lance error si no hay una conexión a la DB
mongoose.set("autoCreate", false); // disable `autoCreate` since `bufferCommands` is false, value)

// Load global mocks
const mockFiles = glob.sync("**/*.globalmock.ts", {
  cwd: path.join(__dirname, "src"),
  absolute: true,
} );

mockFiles.forEach((file) => {
  require(file);
} );
