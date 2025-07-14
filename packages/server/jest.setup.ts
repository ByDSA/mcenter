import "reflect-metadata";

import { existsSync } from "node:fs";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { isDebugging } from "../shared/src/utils/vscode";

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
