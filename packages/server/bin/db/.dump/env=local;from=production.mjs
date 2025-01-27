#!/usr/bin/env dazx

import { loadEnv } from "dazx/bash";
import { mongodump } from "dazx/mongo";

console.log = (...msg) => $.log( {
  kind: "stdout",
  verbose: true,
  data: `${msg.map((o) => {
    if (typeof o === "string")
      return o;

    return JSON.stringify(o, null, 2);
  } ).join(" ")}\n`,
} );

const thisFolder = __dirname;
// Importar variables de entorno
const { from } = process.env;
const folderEnv = path.join(thisFolder, "..");
const envFiles = fs.readdirSync(folderEnv).filter((f) => {
  const match = f.match(/^\.env\.[a-z]+$/);

  if (match === null)
    return false;

  const env = match[0].replace(/^\.env\./, "");

  return from.match(`^${env}`) !== null;
} );

if (envFiles.length === 0) {
  console.log("No env files found");
  process.exit(1);
}

if (envFiles.length > 1) {
  console.log("Multiple env files found");
  process.exit(1);
}

const envPath = path.join(folderEnv, envFiles[0]);

await loadEnv(envPath);

const { MONGODB_URI, outFile } = process.env;

if (MONGODB_URI === undefined) {
  console.log("MONGODB_URI is not set");
  process.exit(1);
}

console.log(`Output file: ${outFile}`);

await mongodump( {
  uri: MONGODB_URI,
  archive: true,
  outFile,
} );

console.log("Done!");
