#!/usr/bin/env dazx

import { loadEnv } from "dazx/bash";

const thisPath = __dirname;
const folderName = thisPath.split("/").pop();
const envPath = path.join(thisPath, "../../", `.env.${folderName}`);

loadEnv(envPath);

const { DB_PASSWORD } = process.env;

if (DB_PASSWORD === undefined) {
  console.log("DB_PASSWORD is not set");
  process.exit(1);
}

const DB_USERNAME = process.env.DB_USERNAME ?? "root";
const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_PORT = process.env.DB_PORT ?? 27017;

console.log("Importing database");
console.log("AUTH:");
console.log("DB_USERNAME:", DB_USERNAME);
console.log("DB_PASSWORD: ", DB_PASSWORD);
console.log("DB_HOST: ", DB_HOST);
console.log("DB_PORT: ", DB_PORT);

const containerId = (await $`(sudo docker ps | grep mongo | grep "${DB_PORT}/tcp" | awk '{print $1}')`).stdout.trim();
const internalCmd = `mongorestore --host=${DB_HOST} --port=${DB_PORT} --username=${DB_USERNAME} --password=${DB_PASSWORD} --authenticationDatabase=admin --archive --drop`;
const inputFile = argv._[0];

if (inputFile === undefined) {
  console.log("Input file is not set");
  process.exit(1);
}

await $`sudo docker exec -i ${containerId} sh -c ${internalCmd} < ${inputFile}`;
