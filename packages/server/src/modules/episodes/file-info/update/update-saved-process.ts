import fs, { existsSync } from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { ErrorElementResponse, DataResponse, errorToErrorElementResponse } from "$shared/utils/http";
import { compareEpisodeFileInfoOmitEpisodeId } from "$shared/models/episodes/file-info";
import { EpisodeCompKey } from "#episodes/models";
import { EpisodeFile, EpisodeFileInfoRepository, SerieFolderTree } from "#episodes/file-info";
import { EpisodeFileInfo, EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { md5FileAsync } from "#utils/crypt";
import { SavedSerieTreeService } from "../../saved-serie-tree-service";
import { EpisodeOdm } from "../../repositories/odm";
import { Serie } from "../tree/models";

type Model = EpisodeFileInfo;
type Entity = EpisodeFileInfoEntity;
type ModelOmitEpisodeId = Omit<Model, "episodeId">;
const compareModelOmitEpisodeId:
 typeof compareEpisodeFileInfoOmitEpisodeId = compareEpisodeFileInfoOmitEpisodeId;

type Data = Entity[];

type Options = {
  forceHash?: boolean;
};

class FatalError extends Error {
  static of(e: Error) {
    return new FatalError(e.message);
  }
}

@Injectable()
export class UpdateMetadataProcess {
  constructor(
    private readonly savedSerieTreeService: SavedSerieTreeService,
    private readonly episodeFileRepository: EpisodeFileInfoRepository,
  ) {
  }

  async episodeFileToFileInfoOmitEpisodeId(
    episodeFile: EpisodeFile,
  ): Promise<ModelOmitEpisodeId> {
    const { filePath } = episodeFile.content;
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const fullFilePath = `${MEDIA_FOLDER}/${filePath}`;

    if (!existsSync(fullFilePath))
      throw new Error("UpdateMetadataProcess: file '" + fullFilePath + "' not exists");

    const episodeFileInfo: ModelOmitEpisodeId = await new Promise((resolve, reject) =>{
      ffmpeg.ffprobe(fullFilePath, async (err, metadata) => {
        if (err) {
          if (err.message === "Cannot find ffprobe")
            return reject(FatalError.of(err));

          return reject(err);
        }

        if (!metadata)
          return;

        const duration = metadata.format?.duration ?? null;
        const resolution = {
          width: metadata.streams[0].width ?? null,
          height: metadata.streams[0].height ?? null,
        };
        const fps = metadata.streams[0].r_frame_rate ?? null;
        const { mtime, ctime, size } = fs.statSync(fullFilePath);
        const createdAt = new Date(ctime);
        const updatedAt = new Date(mtime);

        console.log(`UpdateMetadataProcess: got metadata of ${filePath}`);

        const ret: ModelOmitEpisodeId = {
          path: filePath,
          hash: await md5FileAsync(fullFilePath),
          size,
          timestamps: {
            createdAt,
            updatedAt,
          },
          mediaInfo: {
            duration,
            resolution,
            fps,
          },
        };

        return resolve(ret);
      } );
    } );

    return episodeFileInfo;
  }

  async genEpisodeFileInfoFromEpisodeOrFail(
    serieId: Serie["id"],
    episode: EpisodeFile,
    options: Options,
  ): Promise<Entity | null> {
    const { filePath, episodeId: episodeKey } = episode.content;
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const currentEpisodeFile = await this.episodeFileRepository.getOneByPath(filePath);
    const fullFilePath = `${MEDIA_FOLDER}/${filePath}`;

    if (!existsSync(fullFilePath)) {
      console.log("UpdateMetadataProcess: file '" + fullFilePath + "' not exists");

      return null;
    }

    const episodeFileInfo = await new Promise((resolve, reject) =>{
      ffmpeg.ffprobe(fullFilePath, async (err, metadata) => {
        if (err) {
          if (err.message === "Cannot find ffprobe")
            return reject(FatalError.of(err));

          return reject(err);
        }

        if (!metadata)
          return;

        const duration = metadata.format?.duration ?? null;
        const resolution = {
          width: metadata.streams[0].width ?? null,
          height: metadata.streams[0].height ?? null,
        };
        const fps = metadata.streams[0].r_frame_rate ?? null;
        const { mtime, ctime, size } = fs.statSync(fullFilePath);
        const createdAt = new Date(ctime);
        const updatedAt = new Date(mtime);

        console.log(`UpdateMetadataProcess: got metadata of ${filePath}`);

        const ret: Omit<Model, "episodeId"> = {
          path: filePath,
          hash: currentEpisodeFile?.hash ?? "null",
          size,
          timestamps: {
            createdAt,
            updatedAt,
          },
          mediaInfo: {
            duration,
            resolution,
            fps,
          },
        };
        const mustUpdate = options.forceHash
           || !currentEpisodeFile
           || !compareModelOmitEpisodeId(ret, currentEpisodeFile);

        if (!mustUpdate)
          return resolve(null);

        ret.hash = await md5FileAsync(fullFilePath);

        console.log(`UpdateMetadataProcess: got hash of ${filePath}`);

        return resolve(ret);
      } );
    } );

    if (episodeFileInfo === null)
      return null;

    const episodeCompKey: EpisodeCompKey = {
      seriesKey: serieId,
      episodeKey: episodeKey,
    };
    const episodeId = await EpisodeOdm.getIdFromCompKey(episodeCompKey);

    if (!episodeId) {
      throw new Error(
        `episode with id ${episodeCompKey.episodeKey} in ${episodeCompKey.seriesKey} not found`,
      );
    }

    const episodeFileWithId = {
      ...episodeFileInfo,
      episodeId: episodeId.toString(),
    } as Entity;

    return episodeFileWithId;
  }

  async genEpisodeFileInfoAndUpdateOrCreate(
    serieId: string,
    episode: EpisodeFile,
    options: Options,
  ): Promise<Entity | null> {
    const episodeFileWithId = await this.genEpisodeFileInfoFromEpisodeOrFail(
      serieId,
      episode,
      options,
    );

    if (episodeFileWithId === null)
      return null;

    await this.episodeFileRepository
      .updateOneByEpisodeId(episodeFileWithId.episodeId, episodeFileWithId);

    return episodeFileWithId;
  }

  async process(options?: Options): Promise<DataResponse<Data>> {
    const seriesTree: SerieFolderTree = await this.savedSerieTreeService.getSavedSeriesTree();

    console.log("UpdateMetadataProcess: got paths");
    const fileInfos: Entity[] = [];
    const errors: ErrorElementResponse[] = [];

    for (const serie of seriesTree.children) {
      for (const season of serie.children) {
        for (const episode of season.children) {
          await this.genEpisodeFileInfoAndUpdateOrCreate(serie.id, episode, {
            forceHash: options?.forceHash ?? false,
          } )
            .then((episodeFileWithId) => {
              if (episodeFileWithId)
                fileInfos.push(episodeFileWithId);
            } )
            .catch((err) => {
              if (err instanceof FatalError)
                throw err;
              else if (err instanceof Error) {
                const error = errorToErrorElementResponse(err);

                errors.push(error);
              }
            } );
        }
      }
    }

    return {
      errors,
      data: fileInfos,
    };
  }
}
