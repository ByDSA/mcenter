#!/usr/bin/env zx

const { workspaceFolder } = process.env;

cd(workspaceFolder);

await debounce(async () => {
  await $`pnpm i && pnpm test && pnpm build`;
} );

async function debounce(action) {
  const debounceRedoFile = path.join(__dirname, ".debounce-redoafterdone");
  const debounceFile = path.join(__dirname, ".debounce-executing");

  $.verbose = false;

  if (fs.existsSync(debounceFile)) {
    console.log("No ejecutado: debounce");
    await $`touch ${debounceRedoFile}`;
    process.exit(0);
  }

  await $`touch ${debounceFile}`;

  do {
    $.verbose = false;
    await $`rm -f ${debounceRedoFile}`;
    $.verbose = true;
    try {
      await action();
    } catch (e) {
      console.error("Error", e);
    }
  } while (fs.existsSync(debounceRedoFile));

  $.verbose = false;
  await $`rm -f ${debounceFile}`;
}
