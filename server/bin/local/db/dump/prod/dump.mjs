#!/usr/bin/env dazx

import { loadEnv } from "dazx/bash";
import { mongodump } from "dazx/mongo";

function genTimestamp() {
  const now = new Date();
  const timestamp = [
    [
      now.getFullYear(),
      (now.getMonth() + 1).toString().padStart(2, "0"),
      now.getDate().toString()
        .padStart(2, "0"),
    ].join("-"),
    [
      now.getHours().toString()
        .padStart(2, "0"),
      now.getMinutes().toString()
        .padStart(2, "0"),
      now.getSeconds().toString()
        .padStart(2, "0"),
    ].join("-"),
  ].join("-");

  return timestamp;
}

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
const folderName = thisFolder.split("/").pop();
const envPath = path.join(thisFolder, "../../../", `.env.${folderName}`);

await loadEnv(envPath);

const { MONGODB_URI } = process.env;

if (MONGODB_URI === undefined) {
  console.log("MONGODB_URI is not set");
  process.exit(1);
}

// Dumping database format YmdHis with new Date on this location
const timestamp = genTimestamp();
const outFile = argv._[0] ?? `${thisFolder}/dump-${timestamp}.db`;

console.log(`Output file: ${outFile}`);

await mongodump( {
  uri: MONGODB_URI,
  archive: true,
  outFile,
} );

console.log("Done!");
