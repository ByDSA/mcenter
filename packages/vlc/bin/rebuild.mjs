#!/usr/bin/env zx

$.verbose = true;

await $`rm -rf node_modules`;
await $`rm -rf ../shared/node_modules`;
await $`rm -rf ../../node_modules`;
await $`pnpm i`;
await $`cd ../shared && pnpm build`;
await $`pnpm build`;
