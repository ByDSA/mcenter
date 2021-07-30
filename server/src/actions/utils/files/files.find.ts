/* eslint-disable no-param-reassign */
import glob from "glob";
import path from "path";
import { calcHashFromFile } from "./files.hash";

export type FindOptions = {
  baseFolder?: string;
  folder?: string;
  recursive?: boolean;
  extensions?: string[];
  fileHash?: string;
  onlyFile?: boolean;
  onlyFirst?: boolean;
}

export function findFiles(options?: FindOptions) {
  const opts = initializeFindByHashOptions(options);

  if (options?.fileHash) {
    if (!opts.folder)
      throw new Error("Options: 'folder' field is required");

    if (opts.recursive)
      return findByHashRecursive(<string>opts.fileHash, opts.folder);

    return findByHashNonRecursive(<string>opts.fileHash, opts.folder);
  }

  if (options?.extensions && options.extensions.length > 0) {
    if (options?.recursive)
      return getAllFilesByExtensionRecursive(<string>opts.folder, <string[]>opts.extensions);

    return getAllFilesByExtensionNonRecursive(<string>opts.folder, <string[]>opts.extensions);
  }

  if (options?.recursive)
    return getAllFilesRecursive(<string>opts?.folder);

  return getAllFilesNonRecursive(<string>opts?.folder);
}

function getAllFilesRecursive(folder: string): string[] {
  if (!folder)
    throw new Error();

  const regex = `${folder}/**/*`;

  return glob.sync(regex, {
    nodir: true,
  } );
}

function getAllFilesNonRecursive(folder: string): string[] {
  if (!folder)
    throw new Error();

  const regex = `${folder}/*`;

  return glob.sync(regex, {
    nodir: true,
  } );
}

function getAllFilesByExtensionRecursive(fullPath: string, extensions: string[]): string[] {
  return getAllFilesByExtensionCommon(fullPath, extensions, "**/*.+("); // Syntax: https://www.npmjs.com/package/glob
}

function getAllFilesByExtensionNonRecursive(fullPath: string, extensions: string[]): string[] {
  return getAllFilesByExtensionCommon(fullPath, extensions, "*.+("); // Syntax: https://www.npmjs.com/package/glob
}

function getAllFilesByExtensionCommon(
  fullPath: string,
  extensions: string[],
  initialRegex: string,
): string[] {
  if (!fullPath)
    throw new Error("Empty path string");

  let regex = `${fullPath}/${initialRegex}`; // Syntax: https://www.npmjs.com/package/glob

  extensions.forEach((el, i, array) => {
    regex += el;

    if (i < array.length)
      regex += "|";
  } );
  regex += ")";

  return glob.sync(regex, {
    nodir: true,
  } );
}

const DefaultOptions: FindOptions = {
  baseFolder: ".",
  folder: ".",
  recursive: true,
  onlyFirst: false,
};

export function initializeFindByHashOptions(options?: FindOptions) {
  return {
    ...DefaultOptions,
    ...options,
  };
}

function findByHashNonRecursive(hash: string, folder: string): string[] {
  const files = findFiles( {
    folder,
  } );

  return matchHashInGroupOfFiles(hash, files);
}

function findByHashRecursive(hash: string, folder: string): string[] {
  const files = findFiles( {
    folder,
    recursive: true,
  } );

  return matchHashInGroupOfFiles(hash, files);
}

function matchHashInGroupOfFiles(hash: string, files: string[]): string[] {
  const ret = [];

  for (const f of files) {
    if (calcHashFromFile(f) === hash)
      ret.push(f);
  }

  return ret;
}

export type HashFile = {
  hash: string;
  path: string;
}

export function fixHashFile<T extends HashFile>(
  obj: T,
  options?: FindOptions,
): T | undefined {
  const opts = initializeFindByHashOptions(options);

  try {
    const fullPath = path.join(options?.folder || "", obj.path);
    const hashFromFile = calcHashFromFile(fullPath);

    if (hashFromFile === obj.hash)
      return obj;

    obj.hash = hashFromFile;
  } catch (e) { // File doesn't exists
    const files = findFiles( {
      fileHash: obj.hash,
      folder: opts.folder,
      recursive: true,
    } );

    if (files.length === 0)
      return undefined;

    const newFile = files[0];

    obj.path = newFile;
  }

  return obj;
}
