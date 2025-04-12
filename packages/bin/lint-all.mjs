#!/usr/bin/env zx

const foldersWithLintScript = (await $`find . -maxdepth 1 -type d -exec test -e '{}/package.json' ';' -print`)
  .toString().split("\n")
  .map((line) => line.replace(/^\.\//, ""))
  .filter(Boolean)
  .filter(folder => {
    const pkg = JSON.parse(fs.readFileSync(path.join(folder, "package.json"), "utf-8"));

    return pkg.scripts && pkg.scripts.lint;
  } );

$.verbose = true;

for (const folder of foldersWithLintScript) {
  const label = folder === "." ? "Infrastructure" : folder;

  echo`\n${"=".repeat(30)}\n${label}\n${"=".repeat(30)}`;

  await $`cd ${folder} && pnpm lint`;
}
