/* eslint-disable import/prefer-default-export */
import path from "path";
import { calcHashFromFile, findFiles as _findFiles, getRelativePath as _getRelativePath } from "../../../files";

export type Config = {
  extensions: string[];
  basePath: string;
};

export function generateCommonFunctions(config: Config) {
  function calcHashFile(relativePath: string) {
    const fullPath = getFullPath(relativePath);
    const hash = calcHashFromFile(fullPath);

    return hash;
  }

  function getFullPath(relativePath: string): string {
    return path.join(config.basePath, relativePath);
  }

  function getRelativePath(fullPath: string): string | null {
    return _getRelativePath(fullPath, config.basePath);
  }

  function findFiles() {
    return findFilesAt("");
  }

  function findFileByHash(fileHash: string) {
    const files = innerFindFilesAt( {
      fileHash,
      relativePath: "",
      onlyFirst: true,
    } );

    return files[0] || null;
  }

  function findFilesAt(relativePath: string) {
    return innerFindFilesAt( {
      relativePath,
      recursive: true,
    } );
  }

  function findFilesNotRecursivelyAt(relativePath: string) {
    return innerFindFilesAt( {
      relativePath,
      recursive: false,
    } );
  }

  type Params = {
    relativePath: string,
    recursive?: boolean,
    fileHash?: string,
    onlyFirst?: boolean
  };
  function innerFindFilesAt( { relativePath,
    recursive = true,
    fileHash,
    onlyFirst = false }: Params) {
    const { basePath } = config;
    const folder = path.join(basePath, relativePath);

    return _findFiles( {
      folder,
      fileHash,
      recursive,
      onlyFirst,
      extensions: config.extensions,
    } ).map((fullPath) => {
      const ret = getRelativePath(fullPath);

      if (!ret)
        throw new Error(`Cannot get relative path from ${fullPath}. Expected base: ${basePath}`);

      return ret;
    } );
  }

  return {
    calcHashFile,
    getFullPath,
    getRelativePath,
    findFiles,
    findFileByHash,
    findFilesAt,
    findFilesNotRecursivelyAt,
  };
}
