/* eslint-disable import/prefer-default-export */
import fs from "fs";
import { join } from "node:path";

let rootPath: string;

export function findRootProjectFolder(p: string = "") {
  if (rootPath)
    return join(rootPath, p);

  let currentPath = __dirname;
  let lastPath = null;

  while (currentPath !== lastPath) {
    if (fs.existsSync(join(currentPath, "package.json"))) {
      rootPath = currentPath;

      return join(currentPath, p);
    }

    lastPath = currentPath;
    currentPath = join(currentPath, "..");
  }

  return null;
}

export function findSrcProjectFolder() {
  const root = findRootProjectFolder();

  if (root)
    return join(root, "src");

  return null;
}