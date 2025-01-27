#!/usr/bin/env node
// @ts-check

// eslint-disable-next-line import/no-absolute-path
import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

(async ()=> {
  $.verbose = false;
  const foldersWithPackage = (await $`find . -maxdepth 1 -type d -exec test -e '{}/package.json' ';' -print`).toString().split("\n")
    .map((line) => line.replace(/^\.\//, ""))
    .filter(Boolean);
  const foldersWithLintScript = [];

  for (const folder of foldersWithPackage) {
    const packageJson = JSON.parse((await $`cat ${folder}/package.json`).toString());

    if (packageJson.scripts && packageJson.scripts.lint)
      foldersWithLintScript.push(folder);
  }

  $.verbose = true;

  for (const folder of foldersWithLintScript) {
    const label = folder === "." ? "Infrastructure" : folder;

    console.log("\n" + "=".repeat(30));
    console.log(label);
    console.log("=".repeat(30) + "\n");

    await $`cd ${folder} && pnpm lint --color=always`;
  }
} )().catch(()=> {
  process.exit(1);
} );
