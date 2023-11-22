/* eslint-disable import/prefer-default-export */
import fs from "node:fs";
import { join } from "node:path";

let rootPath: string;

function getRootProjectFolder() {
  let currentPath = __dirname;
  let lastPath = null;

  while (currentPath !== lastPath) {
    if (fs.existsSync(join(currentPath, "package.json"))) {
      rootPath = currentPath;

      return currentPath;
    }

    lastPath = currentPath;
    currentPath = join(currentPath, "..");
  }

  return null;
}

export function rootFolder() {
  if (rootPath)
    return rootPath;

  const root = getRootProjectFolder();

  if (root === null)
    throw new Error("Could not find root folder");

  rootPath = root;

  return root;
}