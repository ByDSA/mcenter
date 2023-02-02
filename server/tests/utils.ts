/* eslint-disable import/prefer-default-export */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { FileAlreadyExistsError, FileNotFoundError, findRootProjectFolder } from "#utils";

function findTestsProjectFolder() {
  const root = findRootProjectFolder();

  if (root)
    return join(root, "src");

  return null;
}

let testsFolderCached: string;

export function testsFolder(): string {
  if (!testsFolderCached) {
    const found = findTestsProjectFolder();

    if (found === null)
      throw new FileNotFoundError("tests folder");

    testsFolderCached = found;
  }

  return testsFolderCached;
}

export function createTmpFolder() {
  const tmp = join(testsFolder(), "tmp");

  if (existsSync(tmp))
    throw new FileAlreadyExistsError(tmp);

  mkdirSync(tmp);

  return tmp;
}