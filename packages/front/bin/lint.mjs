#!/usr/bin/env zx

$.verbose = true;
await $`prettier --write "**/*.{json,jsonc,scss,yml,yaml}" --color`;
await $`eslint "modules/**/*.{ts,js,tsx,jsx}" --no-warn-ignored --fix --color`;
await $`eslint "app/**/*.{ts,js,tsx,jsx}" --no-warn-ignored --fix --color`;
