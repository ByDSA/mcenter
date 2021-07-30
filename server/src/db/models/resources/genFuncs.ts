import { calcHashFromFile, findFiles as _findFiles, getRelativePath as _getRelativePath } from "@actions/utils/files";
import { Document, Model } from "mongoose";
import path from "path";

export type Config = {
  extensions: string[];
  basePath: string;
};

export function generateCommonFilesFunctions(config: Config) {
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

export type Config2<D extends Document, M extends Model<D>> = {
  model: M;
};

export function generateCommonFindFunctions<D extends Document, M extends Model<D>>(
  config: Config2<D, M>,
) {
  const model = <any>config.model;

  async function findByHash(hash: string): Promise<D | null> {
    const ret: D | null = await model.findOne( {
      hash,
    } );

    return ret;
  }

  async function findByUrl(url: string): Promise<D | null> {
    const ret: D | null = await model.findOne( {
      url,
    } );

    return ret;
  }

  async function findByName(name: string): Promise<D | null> {
    const ret: D | null = await model.findOne( {
      name,
    } );

    return ret;
  }

  async function findAll(): Promise<Array<D>> {
    const ret = await model.find( {
    } );

    return ret;
  }

  async function findByPath(relativePath: string): Promise<D | null> {
    const ret = await model.findOne( {
      path: relativePath,
    } );

    return ret;
  }

  return {
    findByHash,
    findByUrl,
    findByPath,
    findByName,
    findAll,
  };
}
