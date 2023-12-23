/* eslint-disable import/prefer-default-export */

// @ts-check

import fs from "node:fs";
import path from "node:path";

const thisFolder = new URL(".", import.meta.url).pathname;

/**
 *
 * @param {{
 * envFilePath: string,
 * migration: InfoJson,
 * migrationMode: "up" | "down"
 * }} params
 */
export async function migrate(params) {
  const {migration: {id: migrationId, name: migrationName, path: migrationPath}, envFilePath} = params;
  const mainTsPath = path.join(migrationPath, "up.ts");

  console.log(`mainTsPath: ${mainTsPath}`);

  console.log(`Running migration ${migrationId} ...`);
  await $`set -a && source ${envFilePath} && node -r ts-node/register -r tsconfig-paths/register ${mainTsPath}`;

  await updateMigrationCounter(migrationId, envFilePath);

  console.log(`Migration ${migrationName} done`);
}

async function updateMigrationCounter(migrationId, envFilePath) {
  const updateLastMigrationTsPath = path.join(thisFolder, "updateLastMigration.ts");

  await $`set -a && source ${envFilePath} && node -r ts-node/register -r tsconfig-paths/register ${updateLastMigrationTsPath} ${migrationId}`;
}

/**
 * @param {string} envFilePath
 * @returns {Promise<number>}
 */
export async function fetchLastMigration(envFilePath) {
  console.log("Fetching last migration ...");
  const scriptPath = path.join(thisFolder, "fetchMeta.ts");

  $.verbose = false;
  const ret = await $`set -a && source ${envFilePath} && node -r ts-node/register -r tsconfig-paths/register ${scriptPath}`;

  $.verbose = true;

  const retStr = ret.stdout.toString();
  const retJson = JSON.parse(retStr);
  const retNum = Number(retJson?.migrations?.lastMigration);

  if (retNum === undefined)
    throw new Error(`Invalid output from ${scriptPath}: ${retStr}`);

  // retNum should be a string number
  if (Number.isNaN(+retNum))
    throw new Error(`Invalid id (should be a number): ${retNum}`);

  return retNum;
}

/** @typedef {{id: number, name: string, path: string}} InfoJson */

/**
 * @returns {Promise<InfoJson[]>}
 */
export async function fetchListOfMigrations() {
  console.log("Fetching list of migrations...");
  const migrationsFolder = path.join(thisFolder);
  /** @type {InfoJson[]} */
  const ret = [];

  fs.readdirSync(migrationsFolder, {
    withFileTypes: true,
  } )
    .filter((dirent) => dirent.isDirectory())
    .forEach((folder) => {
      const migrationPath = path.join(migrationsFolder, folder.name);
      const infoJsonPath = path.join(migrationPath, "info.json");

      if (!fs.existsSync(infoJsonPath))
        return;

      /** @type {InfoJson} */
      const infoJson = JSON.parse(fs.readFileSync(infoJsonPath, "utf8"));

      infoJson.path = migrationPath;

      if (!infoJson.id)
        throw new Error(`Missing id in ${infoJsonPath}`);

      infoJson.id = +infoJson.id;

      if (Number.isNaN(infoJson.id))
        throw new Error(`Invalid id (should be a number): ${infoJson.id}`);

      if (!infoJson.name)
        throw new Error(`Missing name in ${infoJsonPath}`);

      ret.push(infoJson);
    } );

  ret.sort((a,b) => a.id - b.id);

  assertUniqueSequentialIds(ret);

  assertUniqueNames(ret);

  return ret;
}

function assertUniqueSequentialIds(migrations) {
  for (let i = 0; i < migrations.length; i++) {
    if (migrations[i].id !== migrations[0].id + i)
      throw new Error(`Missing migration id=${migrations[0].id + i}`);
  }
}

function assertUniqueNames(migrations) {
  const names = migrations.map((migration) => migration.name);
  const namesSet = new Set(names);

  if (names.length !== namesSet.size)
    throw new Error(`Duplicate migration name: ${names}`);
}