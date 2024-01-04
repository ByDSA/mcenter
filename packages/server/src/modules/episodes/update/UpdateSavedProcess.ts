import { FileInfoVideoWithSuperId, compareFileInfoVideo } from "#shared/models/episodes/fileinfo";
import { ErrorElementResponse, FullResponse, errorToErrorElementResponse } from "#shared/utils/http";
import { deepMerge } from "#shared/utils/objects";
import { assertIsDefined } from "#shared/utils/validation";
import { md5FileAsync } from "#utils/crypt";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import ffmpeg from "fluent-ffmpeg";
import { existsSync } from "fs";
import fs from "node:fs";
import { Repository } from "../../file-info/repositories";
import { SerieFolderTree } from "../../file-info/tree";
import { EpisodeFileInfo, ModelId as EpisodeId } from "../models";
import { getIdModelOdmFromId } from "../repositories/odm";
import { SavedSerieTreeService } from "../saved-serie-tree-service";

type Model = EpisodeFileInfo;
type ModelWithSuperId = FileInfoVideoWithSuperId;
const compareModel: typeof compareFileInfoVideo = compareFileInfoVideo;

type Data = ModelWithSuperId[];

type Options = {
  forceHash?: boolean;
};

const DepsMap = {
  savedSerieTreeService: SavedSerieTreeService,
  episodeFileRepository: Repository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class UpdateMetadataProcess {
  #deps: Deps;

  #options!: Options;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  // eslint-disable-next-line require-await
  async genEpisodeFileInfoFromFilePathOrFail(filePath: string): Promise<Model | null> {
    const MEDIA_FOLDER = process.env.MEDIA_FOLDER_PATH;

    assertIsDefined(MEDIA_FOLDER);

    const currentEpisodeFile = await this.#deps.episodeFileRepository.getOneByPath(filePath);

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
    const seriesTree: SerieFolderTree = await this.#deps.savedSerieTreeService.getSavedSeriesTree();

    console.log("got paths");
    const fileInfos: ModelWithSuperId[] = [];
    const errors: ErrorElementResponse[] = [];

    for (const serie of seriesTree.children) {
      const serieId = serie.id;

      for (const season of serie.children) {
        for (const episode of season.children) {
          const {episodeId} = episode.content;
          const {filePath} = episode.content;
          const fullId: EpisodeId = {
            serieId,
            innerId: episodeId,
          };
          const f = async () => {
            const episodeIdOdm = await getIdModelOdmFromId(fullId);

            if (!episodeIdOdm)
              throw new Error(`episode with id ${fullId.innerId} in ${fullId.serieId} not found`);

            const episodeFileInfo = await this.genEpisodeFileInfoFromFilePathOrFail(filePath);

            if (episodeFileInfo === null)
              return null;

            const episodeFileWithId = {
              ...episodeFileInfo,
              episodeId: episodeIdOdm.toString(),
            } as ModelWithSuperId;

            await this.#deps.episodeFileRepository.updateOneBySuperId(episodeFileWithId.episodeId, episodeFileWithId);

            return episodeFileWithId;
          };

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