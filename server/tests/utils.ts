import { findRootProjectFolder } from "#utils";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { FileAlreadyExistsError, FileNotFoundError } from "src/utils/fs/errors";

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