#!/usr/bin/env node
// @ts-check

// eslint-disable-next-line import/no-absolute-path
import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

(async ()=> {
  await $`prettier --write "**/*.{json,jsonc,scss,yml,yaml}" --color`;

  await $`eslint "**/*.{ts,js,tsx,jsx,mjs}" --no-warn-ignored --fix --color`;
} )().catch(()=> {
  process.exit(1);
} );
