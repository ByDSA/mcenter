import fs, { existsSync } from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { ErrorElementResponse, FullResponse, errorToErrorElementResponse } from "$shared/utils/http";
import { showError } from "$shared/utils/errors/showError";
import { EpisodeEntity, EpisodeId } from "#episodes/models";
import { EpisodeFile, EpisodeFileInfoRepository, SerieFolderTree } from "#modules/file-info";
import { FileInfoVideo, FileInfoVideoWithSuperId, compareFileInfoVideo } from "#modules/file-info/models";
import { md5FileAsync } from "#utils/crypt";
import { EPISODE_QUEUE_NAME } from "#episodes/repositories";
import { EpisodeEvent } from "#episodes/repositories/Repository";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EventType, PatchEvent } from "#utils/event-sourcing";
import { BrokerEvent } from "#utils/message-broker";
import { episodeToEpisodeFile } from "#episodes/saved-serie-tree-service/adapters";
import { getIdModelOdmFromId } from "../repositories/odm";
import { SavedSerieTreeService } from "../saved-serie-tree-service";

type Model = FileInfoVideo;
type ModelWithSuperId = FileInfoVideoWithSuperId;
const compareModel: typeof compareFileInfoVideo = compareFileInfoVideo;

type Data = ModelWithSuperId[];

type Options = {
  forceHash?: boolean;
};

@Injectable()
export class UpdateMetadataProcess {
  constructor(
    private readonly savedSerieTreeService: SavedSerieTreeService,
    private readonly episodeFileRepository: EpisodeFileInfoRepository,
     private readonly domainMessageBroker: DomainMessageBroker,
  ) {
    this.domainMessageBroker.subscribe(EPISODE_QUEUE_NAME, async (event: BrokerEvent<any>) => {
      if (event.type === EventType.CREATED) {
        const ev = event as EpisodeEvent;
        const episode = ev.payload.entity;
        const episodeFile: EpisodeFile = episodeToEpisodeFile(episode);

        await this.genEpisodeFileInfoAndUpdateOrCreate(
          episode.id.serieId,
          episodeFile,
          {
            forceHash: true,
          },
        );
      } else if (event.type === EventType.PATCHED) {
        const ev = event as PatchEvent<EpisodeEntity, EpisodeId>;

        if (ev.payload.key === "path") {
          const episodeFile: EpisodeFile = episodeToEpisodeFile( {
            id: ev.payload.entityId,
            path: ev.payload.value as string,
          } );

          await this.genEpisodeFileInfoAndUpdateOrCreate(
            ev.payload.entityId.serieId,
            episodeFile,
            {
              forceHash: false,
            },
          );
        }
      }

      return Promise.resolve();
    } ).catch(showError);
  }

  async genEpisodeFileInfoFromEpisodeOrFail(
    serieId: string,
    episode: EpisodeFile,
    options: Options,
  ): Promise<ModelWithSuperId | null> {
    const { filePath, episodeId } = episode.content;
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const currentEpisodeFile = await this.episodeFileRepository.getOneByPath(filePath);
    const episodeFileInfo = await new Promise((resolve, reject) =>{
      const fullFilePath = `${MEDIA_FOLDER}/${filePath}`;

      if (existsSync(fullFilePath)) {
        ffmpeg.ffprobe(fullFilePath, async (err, metadata) => {
          if (err)
            reject(err);

          const duration = metadata.format?.duration ?? null;
          const resolution = {
            width: metadata.streams[0].width ?? null,
            height: metadata.streams[0].height ?? null,
          };
          const fps = metadata.streams[0].r_frame_rate ?? null;
          const { mtime, ctime, size } = fs.statSync(fullFilePath);
          const createdAt = new Date(ctime);
          const updatedAt = new Date(mtime);

          console.log(`got metadata of ${filePath}`);

          const ret: Model = {
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
           || !compareModel(ret, currentEpisodeFile);

          if (!mustUpdate) {
            resolve(null);

            return;
          }

          ret.hash = await md5FileAsync(fullFilePath);

          console.log(`got hash of ${filePath}`);

          resolve(ret);
        } );
      } else
        resolve(null);
    } );

    if (episodeFileInfo === null)
      return null;

    const fullId: EpisodeId = {
      serieId,
      innerId: episodeId,
    };
    const episodeDbId = await getIdModelOdmFromId(fullId);

    if (!episodeDbId)
      throw new Error(`episode with id ${fullId.innerId} in ${fullId.serieId} not found`);

    const episodeFileWithId = {
      ...episodeFileInfo,
      episodeId: episodeDbId.toString(),
    } as ModelWithSuperId;

    return episodeFileWithId;
  }

  async genEpisodeFileInfoAndUpdateOrCreate(
    serieId: string,
    episode: EpisodeFile,
    options: Options,
  ): Promise<ModelWithSuperId | null> {
    const episodeFileWithId = await this.genEpisodeFileInfoFromEpisodeOrFail(
      serieId,
      episode,
      options,
    );

    if (episodeFileWithId === null)
      return null;

    await this.episodeFileRepository
      .updateOneByEpisodeDbId(episodeFileWithId.episodeId, episodeFileWithId);

    return episodeFileWithId;
  }

  async process(options?: Options): Promise<FullResponse<Data>> {
    const seriesTree: SerieFolderTree = await this.savedSerieTreeService.getSavedSeriesTree();

    console.log("got paths");
    const fileInfos: ModelWithSuperId[] = [];
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
              if (err instanceof Error) {
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
