#!/usr/bin/env zx
$.verbose = true;

const packageJson = await fs.readJson("./package.json");
const startScript = packageJson.scripts.start;
const result = await $`ps -eo pid,cmd | grep ${startScript} | grep -v grep |
  awk '{print $1}'`.nothrow();
const pid = (result.stdout ?? "").trim();

if (pid) {
  const pids = pid.stdout.trim().replace(/\n/g, " ");

  await $`pkill -P ${pids}`; // Termina los pid hijos (cierra también el proceso de node padre)
  await $`kill -9 ${pids}`; // Termina con el proceso en sí (por si no se ha cerrado solo)
} else
  console.log("No processes to stop.");
