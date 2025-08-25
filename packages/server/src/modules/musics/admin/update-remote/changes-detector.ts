import { MusicFileInfoEntity, MusicFileInfoOmitMusicId } from "$shared/models/musics/file-info";
import { md5FileAsync } from "#utils/crypt";
import { getAbsolutePath } from "../../utils";

type GroupBySize<T> = {
  [size: number | symbol]: T[];
};

export type Changes = {
  new: MusicFileInfoOmitMusicId[];
  deleted: MusicFileInfoEntity[];
  moved: {original: MusicFileInfoEntity;
newPath: string;}[];
  updated: {old: MusicFileInfoEntity;
new: MusicFileInfoEntity;}[];
};

type Options = {
  useOnlyHashChecking?: boolean;
};
export class ChangesDetector {
  #remoteFiles: MusicFileInfoEntity[];

  #localFiles: MusicFileInfoOmitMusicId[];

  #remoteMusicGroupedBySize: GroupBySize<MusicFileInfoEntity>;

  #localFilesGroupedBySize: GroupBySize<MusicFileInfoOmitMusicId>;

  #pathToRemoteMusic: Map<string, MusicFileInfoEntity>;

  #pathToLocalMusicFile: Map<string, MusicFileInfoOmitMusicId>;

  #options: Required<Options>;

  constructor(
    remoteMusic: MusicFileInfoEntity[],
    localFiles: MusicFileInfoOmitMusicId[],
    options?: Options,
  ) {
    this.#remoteFiles = remoteMusic;
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
  ): Promise<MusicFileInfoOmitMusicId | null> {
    const candidateByPath = this.#pathToLocalMusicFile.get(remoteMusic.path);

    if (candidateByPath && await this.#isSameFile(remoteMusic, candidateByPath))
      return candidateByPath;

    const candidates = [] as MusicFileInfoOmitMusicId[];

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
    localFile: MusicFileInfoOmitMusicId,
  ): Promise<MusicFileInfoEntity | null> {
    const candidateByPath = this.#pathToRemoteMusic.get(localFile.path);

    if (candidateByPath && await this.#isSameFile(candidateByPath, localFile))
      return candidateByPath;

    const candidates = [] as MusicFileInfoEntity[];
    const group = this.#remoteMusicGroupedBySize[localFile.size];

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
    for (const m of this.#remoteFiles) {
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
      const { size } = ml;

      if (!this.#localFilesGroupedBySize[size])
        this.#localFilesGroupedBySize[size] = [];

      this.#localFilesGroupedBySize[size].push(ml);

      this.#pathToLocalMusicFile.set(ml.path, ml);
    }
  }

  async detectChanges(): Promise<Changes> {
    const ret = {
      new: [] as MusicFileInfoOmitMusicId[],
      deleted: [] as MusicFileInfoEntity[],
      moved: [] as {original: MusicFileInfoEntity;
newPath: string;}[],
      updated: [] as {old: MusicFileInfoEntity;
new: MusicFileInfoEntity;}[],
    };

    this.#createCaches();

    for (const m of this.#remoteFiles) {
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
        else {
          ret.updated.push( {
            old: foundSamePath,
            new: {
              id: foundSamePath.id,
              musicId: foundSamePath.musicId,
              ...ml,
            },
          } );
        }
      }
    }

    return ret;
  }

  async #isSameFile(file: MusicFileInfoEntity, fileWithMetadata: MusicFileInfoOmitMusicId) {
    if (!this.#options.useOnlyHashChecking
      && file.size !== fileWithMetadata.size)
      return false;

    if (!file.hash)
      throw new Error("music.hash is undefined");

    if (!fileWithMetadata.hash)
      fileWithMetadata.hash = await md5FileAsync(getAbsolutePath(fileWithMetadata.path));

    if (file.hash !== fileWithMetadata.hash)
      return false;

    return true;
  }
}

const noKeySymbol = Symbol("noKey");
