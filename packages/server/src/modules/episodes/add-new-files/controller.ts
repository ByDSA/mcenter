import path from "node:path";
import { Controller, Get } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { ErrorElementResponse, errorToErrorElementResponse, DataResponse } from "$shared/utils/http";
import { Episode, EpisodeEntity } from "#episodes/models";
import { diffSerieTree, findAllSerieFolderTreesAt, OldNewSerieTree as OldNew } from "#episodes/file-info";
import { SerieRepository } from "#modules/series/repositories";
import { Serie } from "#episodes/file-info/tree/models";
import { EpisodesRepository } from "../repositories";
import { SavedSerieTreeService } from "../saved-serie-tree-service";

@Controller("/actions/add-new-files")
export class EpisodeAddNewFilesController {
  constructor(
    private readonly serieRepository: SerieRepository,
    private readonly episodeRepository: EpisodesRepository,
    private readonly savedSerieTreeService: SavedSerieTreeService,
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
      new: Episode[];
      updated: Episode[];
    } = {
      new: [],
      updated: [],
    };

    try {
      data.new.push(...await this.#saveNewEpisodes(diff.new.children));
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

  async #updateEpisodes(oldNew: OldNew[]): Promise<Episode[]> {
    if (oldNew.length === 0)
      return [];

    const promises: Promise<Episode | null>[] = [];

    for (const entry of oldNew) {
      const p: Promise<Episode | null> = this.episodeRepository
        .patchOneByPathAndGet(entry.old.content.filePath, {
          path: entry.new.content.filePath,
        } );

      promises.push(p);
    }

    const all = await Promise.all(promises);
    const allNotNull = all.filter(e => e !== null) as Episode[];

    return allNotNull;
  }

  async #saveNewEpisodes(seriesInTree: Serie[]): Promise<EpisodeEntity[]> {
    const episodes: EpisodeEntity[] = [];
    const now = new Date();

    // TODO: quitar await en for si se puede
    for (const serieInTree of seriesInTree) {
      let serie = await this.serieRepository.getOneById(serieInTree.id);

      if (!serie) {
        serie = await this.serieRepository.createOneAndGet( {
          name: serieInTree.id,
          id: serieInTree.id,
        } );
      }

      for (const seasonInTree of serieInTree.children) {
        for (const episodeInTree of seasonInTree.children) {
          const episode: EpisodeEntity = {
            id: {
              code: episodeInTree.content.episodeId,
              serieId: serie.id,
            },
            path: episodeInTree.content.filePath,
            title: `${serie.name} ${episodeInTree.content.episodeId}`,
            weight: 0,
            timestamps: {
              createdAt: now,
              updatedAt: now,
              addedAt: now,
            },
          };

          episodes.push(episode);
        }
      }
    }

    await this.episodeRepository.createManyAndGet(episodes);

    return episodes;
  }
}
