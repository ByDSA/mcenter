#!/usr/bin/env zx

$.verbose = true;
await $`prettier --write "**/*.{json,jsonc,scss,yml,yaml}" --color`;
await $`eslint "**/*.{ts,js,tsx,jsx,mjs}" --no-warn-ignored --fix --color`;
