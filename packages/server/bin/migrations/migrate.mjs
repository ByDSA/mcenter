#!/usr/bin/env zx
// @ts-check

//  Uso: pnpm db:migrate <migrationFolder> <targetEnv>

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fetchLastMigration, fetchListOfMigrations, migrate } from "./utils.mjs";

/** @typedef {string|undefined} Arg */

/** @type {Arg} */
const migrationNameArg = argv._[0];
const migrationName = migrationNameArg ?? undefined;
/** @type {Arg} */
const targetEnvArg = argv.e ?? argv.env;
const targetEnv = targetEnvArg ?? "dev";

(async () => {
  console.log(`Target Env: ${targetEnv}`);
  console.log(`Migration Name: ${migrationName}`);
  $.verbose = false;

  const thisFolder = new URL(".", import.meta.url).pathname;
  const envFilePath = await locateEnvFile(thisFolder);

  $.verbose = true;

  console.log(`Env File: ${envFilePath}`);

  const lastMigration = (await fetchLastMigration(envFilePath));

  console.log(`Last migration id: ${lastMigration}`);

  const migrations = await fetchListOfMigrations();

  console.log(`All migrations: ${migrations.map((migration) => `${migration.name} (${migration.id})`)}`);

  let thisMigration;

  if (migrationName === undefined) {
    thisMigration = migrations.at(-1);

    if (thisMigration === undefined)
      throw new Error("No migrations found");

    if (thisMigration.id <= lastMigration) {
      console.log("There are no migrations to do");
      process.exit(0);
    }
  } else {
    thisMigration = migrations.find((migration) => migration.name === migrationName);

    if (thisMigration === undefined)
      throw new Error(`Migration ${migrationName} not found`);

    if (thisMigration.id <= lastMigration)
      throw new Error(`Migration ${migrationName} already done`);
  }

  const additionalMigrationsToDo = migrations.filter((migration) => migration.id > lastMigration && migration.id < thisMigration.id);

  if (additionalMigrationsToDo.length > 0) {
    console.log(`remaining migrations: ${additionalMigrationsToDo.map((migration) => migration.name)}`);

    for (const migration of additionalMigrationsToDo) {
      await migrate( {
        migration,
        envFilePath,
        migrationMode: "up",
      } );
    }
  } else
    console.log("No additional migrations to do");

  await migrate( {
    migration: thisMigration,
    envFilePath,
    migrationMode: "up",
  } );
} )();

/**
 *
 * @param {string} rootPath
 * @returns {Promise<string>}
 */
async function locateEnvFile(rootPath) {
  const possibleEnvFilesPath = [join(rootPath, `.env.${targetEnv}`), join(rootPath, ".env")];
  let envFilePath = "";

  for (const possibleEnvFilePath of possibleEnvFilesPath) {
    if (existsSync(possibleEnvFilePath)) {
      envFilePath = possibleEnvFilePath;
      break;
    }
  }

  if (!envFilePath)
    throw new Error("Please provide a .env file");

  return envFilePath;
}
