#!/usr/bin/env zx
const workspaceFolder = process.env.workspaceFolder;

cd(workspaceFolder);

await debounce(async () => {
  await $`pnpm i && pnpm test && pnpm build`;
});

async function debounce(action) {
  const debounceRedoFile = path.join(__dirname, ".debounce-redoafterdone");
  const debounceFile = path.join(__dirname, ".debounce-executing");
  $.verbose = false;
  if (fs.existsSync(debounceFile)) {
    console.log('No ejecutado: debounce');
    await $`touch ${debounceRedoFile}`;
    process.exit(0);
  }

  await $`touch ${debounceFile}`;
  do {
    $.verbose = false;
    await $`rm -f ${debounceRedoFile}`;
    $.verbose = true;
    await action();
  } while(fs.existsSync(debounceRedoFile));
  $.verbose = false;
  await $`rm -f ${debounceFile}`;
}