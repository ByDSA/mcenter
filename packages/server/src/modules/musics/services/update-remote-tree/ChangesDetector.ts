import { Stats } from "node:fs";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { md5FileAsync } from "#utils/crypt";
import { getFullPath } from "../../utils";

export type FileWithStats = {
  path: string;
  stats: Stats;
  hash?: string;
};

type GroupBySize<T> = {
  [size: number | symbol]: T[];
};

export type Changes = {
  new: FileWithStats[];
  deleted: MusicFileInfoEntity[];
  moved: {original: MusicFileInfoEntity;
newPath: string;}[];
  updated: MusicFileInfoEntity[];
};

type Options = {
  useOnlyHashChecking?: boolean;
};
export class ChangesDetector {
  #remoteMusic: MusicFileInfoEntity[];

  #localFiles: FileWithStats[];

  #remoteMusicGroupedBySize: GroupBySize<MusicFileInfoEntity>;

  #localFilesGroupedBySize: GroupBySize<FileWithStats>;

  #pathToRemoteMusic: Map<string, MusicFileInfoEntity>;

  #pathToLocalMusicFile: Map<string, FileWithStats>;

  #options: Required<Options>;

  constructor(remoteMusic: MusicFileInfoEntity[], localFiles: FileWithStats[], options?: Options) {
    this.#remoteMusic = remoteMusic;
    this.#localFiles = localFiles;

    this.#remoteMusicGroupedBySize = {};

    this.#localFilesGroupedBySize = {};

    this.#pathToRemoteMusic = new Map();

    this.#pathToLocalMusicFile = new Map();

    this.#options = {
      useOnlyHashChecking: false,
      ...options,
    };
  }

  async #findRemoteMusicInLocalFiles(
    remoteMusic: MusicFileInfoEntity,
  ): Promise<FileWithStats | null> {
    const candidateByPath = this.#pathToLocalMusicFile.get(remoteMusic.path);

    if (candidateByPath && await this.#isSameFile(remoteMusic, candidateByPath))
      return candidateByPath;

    const candidates = [] as FileWithStats[];

    if (remoteMusic.size !== null) {
      const candidatesWithSameSize = this.#localFilesGroupedBySize[remoteMusic.size];

      if (candidatesWithSameSize)
        candidates.push(...candidatesWithSameSize);
    }

    const candidatesNoGrouped = this.#localFilesGroupedBySize[noKeySymbol];

    if (candidatesNoGrouped)
      candidates.push(...candidatesNoGrouped);

    for (const candidate of candidates) {
      if (await this.#isSameFile(remoteMusic, candidate))
        return candidate;
    }

    return null;
  }

  async #findLocalFileMusicInRemoteMusics(
    localFile: FileWithStats,
  ): Promise<MusicFileInfoEntity | null> {
    const candidateByPath = this.#pathToRemoteMusic.get(localFile.path);

    if (candidateByPath && await this.#isSameFile(candidateByPath, localFile))
      return candidateByPath;

    const candidates = [] as MusicFileInfoEntity[];
    const group = this.#remoteMusicGroupedBySize[localFile.stats.size];

    if (group)
      candidates.push(...group);

    const candidatesNoGrouped = this.#remoteMusicGroupedBySize[noKeySymbol];

    if (candidatesNoGrouped)
      candidates.push(...candidatesNoGrouped);

    for (const candidate of candidates) {
      if (await this.#isSameFile(candidate, localFile))
        return candidate;
    }

    return null;
  }

  #createCaches() {
    for (const m of this.#remoteMusic) {
      const size = m.size ?? noKeySymbol;
      let group = this.#remoteMusicGroupedBySize[size];

      if (!group) {
        group = [];
        this.#remoteMusicGroupedBySize[size] = group;
      }

      group.push(m);

      this.#pathToRemoteMusic.set(m.path, m);
    }

    for (const ml of this.#localFiles) {
      const { size } = ml.stats;

      if (!this.#localFilesGroupedBySize[size])
        this.#localFilesGroupedBySize[size] = [];

      this.#localFilesGroupedBySize[size].push(ml);

      this.#pathToLocalMusicFile.set(ml.path, ml);
    }
  }

  async detectChanges(): Promise<Changes> {
    const ret = {
      new: [] as FileWithStats[],
      deleted: [] as MusicFileInfoEntity[],
      moved: [] as {original: MusicFileInfoEntity;
newPath: string;}[],
      updated: [] as MusicFileInfoEntity[],
    };

    this.#createCaches();

    for (const m of this.#remoteMusic) {
      const foundSamePath = this.#pathToLocalMusicFile.get(m.path);

      if (!foundSamePath) {
        const foundSameContent = await this.#findRemoteMusicInLocalFiles(m);

        if (foundSameContent) {
          ret.moved.push( {
            original: m,
            newPath: foundSameContent.path,
          } );
        } else
          ret.deleted.push(m);
      }
    }

    for (const ml of this.#localFiles) {
      const foundSamePath = this.#pathToRemoteMusic.get(ml.path);
      const foundSameContent = await this.#findLocalFileMusicInRemoteMusics(ml);

      if (!foundSameContent) {
        if (!foundSamePath)
          ret.new.push(ml);
        else
          ret.updated.push(foundSamePath);
      }
    }

    return ret;
  }

  async #isSameFile(music: MusicFileInfoEntity, fileWithMetadata: FileWithStats) {
    if (!this.#options.useOnlyHashChecking
      && music.size && music.size === fileWithMetadata.stats.size)
      return true;

    if (!music.hash)
      throw new Error("music.hash is undefined");

    if (!fileWithMetadata.hash)

      fileWithMetadata.hash = await md5FileAsync(getFullPath(fileWithMetadata.path));

    if (music.hash !== fileWithMetadata.hash)
      return false;

    return true;
  }
}

const noKeySymbol = Symbol("noKey");
