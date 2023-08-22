import { rootFolder } from "#utils";
import { FileAlreadyExistsError, FileNotFoundError } from "#utils/fs";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function getTestsProjectFolder() {
  const root = rootFolder();
  const possibleFolders = [
    "test", "tests", "spec", "specs",
  ];

  for (const folder of possibleFolders) {
    const possibleFolder = join(root, folder);

    if (existsSync(possibleFolder))
      return possibleFolder;
  }

  return null;
}

let testsFolderCached: string | null = null;

export function testsFolder(): string {
  if (testsFolderCached)
    return testsFolderCached;

  testsFolderCached = getTestsProjectFolder();

  if (testsFolderCached === null)
    throw new FileNotFoundError("Could not find tests folder");

  return testsFolderCached;
}

export function createTmpFolder() {
  const tmp = join(testsFolder(), "tmp");

  if (existsSync(tmp))
    throw new FileAlreadyExistsError(tmp);

  mkdirSync(tmp);

  return tmp;
}