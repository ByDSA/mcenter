import path from "node:path";
import { Controller, Get } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { ErrorElementResponse, errorToErrorElementResponse, DataResponse } from "$shared/utils/http";
import { Episode } from "#episodes/models";
import { diffSerieTree, EpisodeFileInfoRepository, findAllSerieFolderTreesAt, OldNewSerieTree as OldNew } from "#episodes/file-info";
import { SerieRepository } from "#modules/series/repositories";
import { Serie } from "#episodes/file-info/tree/models";
import { EpisodeFileInfo, EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { UpdateMetadataProcess } from "#episodes/file-info/update/update-saved-process";
import { EpisodesRepository } from "../repositories";
import { SavedSerieTreeService } from "../saved-serie-tree-service";

@Controller("/actions/add-new-files")
export class EpisodeAddNewFilesController {
  constructor(
    private readonly seriesRepo: SerieRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly savedSerieTreeService: SavedSerieTreeService,
    private readonly fileInfoRepo: EpisodeFileInfoRepository,
    private readonly updateMetadataProcess: UpdateMetadataProcess,
  ) {
  }

  @Get("/")
  async endpoint() {
    const { MEDIA_FOLDER_PATH } = process.env;

    assertIsDefined(MEDIA_FOLDER_PATH);

    const errors: ErrorElementResponse[] = [];
    const filesSerieTreeResult = findAllSerieFolderTreesAt(path.join(MEDIA_FOLDER_PATH, "series"), {
      baseFolder: "series/",
    } );

    if (filesSerieTreeResult.errors)
      errors.push(...filesSerieTreeResult.errors);

    const savedSerieTree = await this.savedSerieTreeService.getSavedSeriesTree();
    const diff = diffSerieTree(
      savedSerieTree,
      {
        children: filesSerieTreeResult.data,
      },
    );

    diff.moved = diff.moved.filter(move => move.old.content.filePath !== move.new.content.filePath);

    const data: {
      new: EpisodeFileInfo[];
      updated: EpisodeFileInfo[];
    } = {
      new: [],
      updated: [],
    };

    try {
      data.new.push(...await this.#saveNewFileInfosAndEpisode(diff.new.children));
      data.updated.push(...await this.#updateEpisodes([...diff.updated, ...diff.moved]));
    } catch (err) {
      if (err instanceof Error) {
        const error = errorToErrorElementResponse(err);

        errors.push(error);
      }
    }
    const responseObj: DataResponse<typeof data> = {
      errors,
      data,
    };

    return responseObj;
  }

  async #updateEpisodes(oldNew: OldNew[]): Promise<EpisodeFileInfoEntity[]> {
    if (oldNew.length === 0)
      return [];

    const promises: Promise<EpisodeFileInfoEntity | null>[] = [];

    for (const entry of oldNew) {
      const p: Promise<EpisodeFileInfoEntity | null> = this.fileInfoRepo
        .patchOneByPathAndGet(entry.old.content.filePath, {
          entity: {
            path: entry.new.content.filePath,
          },
        } );

      promises.push(p);
    }

    const all = await Promise.all(promises);
    const allNotNull = all.filter(Boolean);

    return allNotNull as EpisodeFileInfoEntity[];
  }

  async #saveNewFileInfosAndEpisode(seriesInTree: Serie[]): Promise<EpisodeFileInfoEntity[]> {
    const fileInfos: EpisodeFileInfoEntity[] = [];
    const now = new Date();

    // TODO: quitar await en for si se puede
    for (const serieInTree of seriesInTree) {
      let serie = await this.seriesRepo.getOneByKey(serieInTree.id);

      if (!serie) {
        serie = await this.seriesRepo.createOneAndGet( {
          name: serieInTree.id,
          key: serieInTree.id,
        } );
      }

      for (const seasonInTree of serieInTree.children) {
        for (const episodeInTree of seasonInTree.children) {
          const episode: Episode = {
            compKey: {
              episodeKey: episodeInTree.content.episodeId,
              seriesKey: serie.key,
            },
            title: `${serie.name} ${episodeInTree.content.episodeId}`,
            weight: 0,
            timestamps: {
              createdAt: now,
              updatedAt: now,
              addedAt: now,
            },
          };
          const gotEpisode = await this.episodesRepo.createOneAndGet(episode);
          const fileInfo: EpisodeFileInfo = {
            ...await this.updateMetadataProcess.episodeFileToFileInfoOmitEpisodeId(episodeInTree),
            episodeId: gotEpisode.id,
          };
          const gotFileInfo = await this.fileInfoRepo.createOneAndGet(fileInfo);

          fileInfos.push(gotFileInfo);
        }
      }
    }

    return fileInfos;
  }
}
