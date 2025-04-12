#!/usr/bin/env zx

$.verbose = true;
await $`prettier --write "**/*.{json,jsonc,scss,yml,yaml}" --color`;
await $`eslint "**/*.{ts,js,mjs}" --no-warn-ignored --fix --color`;
