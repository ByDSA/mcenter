import { getIdModelOdmFromId } from "#modules/episodes/repositories/odm";
import { EpisodeFileInfo, EpisodeFullId } from "#shared/models/episodes";
import { FileInfoWithSuperId, compareFileInfo } from "#shared/models/episodes/fileinfo";
import { ErrorElementResponse, FullResponse, errorToErrorElementResponse } from "#shared/utils/http";
import { deepMerge } from "#shared/utils/objects";
import { assertIsDefined } from "#shared/utils/validation";
import ffmpeg from "fluent-ffmpeg";
import { existsSync } from "fs";
import crypto from "node:crypto";
import fs from "node:fs";
import SavedSerieTreeService from "../../saved-serie-tree-service/SavedSerieTreeService";
import { Repository } from "../repositories";
import { SerieFolderTree } from "../tree";

type Model = EpisodeFileInfo;
type ModelWithSuperId = FileInfoWithSuperId;
const compareModel: typeof compareFileInfo = compareFileInfo;

type Data = ModelWithSuperId[];
function md5FileAsync(fullFilePath: string): Promise<string> {
  return new Promise((res, rej) => {
    const hash = crypto.createHash("md5");
    const rStream = fs.createReadStream(fullFilePath);

    rStream.on("data", (data) => {
      hash.update(data);
    } );
    rStream.on("error", (err) => {
      rej(err);
    } );
    rStream.on("end", () => {
      res(hash.digest("hex"));
    } );
  } );
}

type Options = {
  forceHash?: boolean;
};

type Params = {
  savedSerieTreeService: SavedSerieTreeService;
  episodeFileRepository: Repository;
};

export default class UpdateMetadataProcess {
  #episodeFileRepository: Repository;

  #options!: Options;

  #savedSerieTreeService: SavedSerieTreeService;

  constructor( {savedSerieTreeService, episodeFileRepository}: Params) {
    this.#episodeFileRepository = episodeFileRepository;
    this.#savedSerieTreeService = savedSerieTreeService;
  }

  // eslint-disable-next-line require-await
  async genEpisodeFileInfoFromFilePathOrFail(filePath: string): Promise<Model | null> {
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const currentEpisodeFile = await this.#episodeFileRepository.getOneByPath(filePath);

    return new Promise((resolve, reject) =>{
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
          const size = metadata.format?.size ?? null;
          const { mtime, ctime } = fs.statSync(fullFilePath);
          const createdAt = new Date(ctime);
          const updatedAt = new Date(mtime);

          console.log(`got metadata of ${filePath}`);
          const hash = currentEpisodeFile?.hash ?? null;
          const ret: Model = {
            path: filePath,
            hash,
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
          const mustUpdate = this.#options.forceHash || !currentEpisodeFile || !compareModel(ret, currentEpisodeFile);

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
  }

  async process(options?: Options): Promise<FullResponse<Data>> {
    this.#options = deepMerge( {
      forceHash: false,
    }, options);
    const seriesTree: SerieFolderTree = await this.#savedSerieTreeService.getSavedSeriesTree();

    console.log("got paths");
    const fileInfos: ModelWithSuperId[] = [];
    const errors: ErrorElementResponse[] = [];

    for (const serie of seriesTree.children) {
      const serieId = serie.id;

      for (const season of serie.children) {
        for (const episode of season.children) {
          const {episodeId} = episode.content;
          const {filePath} = episode.content;
          const fullId: EpisodeFullId = {
            serieId,
            episodeId,
          };
          const f = async () => {
            const episodeIdOdm = await getIdModelOdmFromId(fullId);

            if (!episodeIdOdm)
              throw new Error(`episode with id ${fullId.episodeId} in ${fullId.serieId} not found`);

            // eslint-disable-next-line no-await-in-loop
            const episodeFileInfo = await this.genEpisodeFileInfoFromFilePathOrFail(filePath);

            if (episodeFileInfo === null)
            // eslint-disable-next-line no-continue
              return null;

            const episodeFileWithId = {
              ...episodeFileInfo,
              episodeId: episodeIdOdm.toString(),
            } as ModelWithSuperId;

            await this.#episodeFileRepository.updateOneBySuperId(episodeFileWithId.episodeId, episodeFileWithId);

            return episodeFileWithId;
          };

          // eslint-disable-next-line no-await-in-loop
          await f()
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