#!/usr/bin/env dazx

const thisPath = __dirname;
const dumpTmp = path.join(thisPath, "dump.db");
// Dump prod
const dumpProd = path.join(thisPath, "../../dump.mjs");

await $`${dumpProd} --from=production ${dumpTmp}`;

// Import local
const importLocal = path.join(thisPath, "../../import/local/import.mjs");

await $`${importLocal} ${dumpTmp}`;

// Remove dump
await fs.unlink(dumpTmp);
