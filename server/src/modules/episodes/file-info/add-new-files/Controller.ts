/* eslint-disable no-await-in-loop */
import { Episode, EpisodeRepository } from "#modules/episodes";
import { SavedSerieTreeService } from "#modules/episodes/saved-serie-tree-service";
import { SerieRelationshipWithStreamFixer, SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { ErrorElementResponse, FullResponse, errorToErrorElementResponse } from "#shared/utils/http";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import path from "path";
import { diffSerieTree, findAllSerieFolderTreesAt } from "../tree";
import { OldNew } from "../tree/diff";
import { Serie } from "../tree/models";

export default class ThisController implements Controller {
  #savedSerieTreeService: SavedSerieTreeService;

  #episodeRepository: EpisodeRepository;

  #serieRepository: SerieRepository;

  constructor() {
    const relationshipWithStreamFixer = new SerieRelationshipWithStreamFixer( {
      streamRepository: new StreamRepository(),
    } );
    const serieRepository = new SerieRepository(
      {
        relationshipWithStreamFixer,
      },
    );
    const episodeRepository = new EpisodeRepository();

    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;

    this.#savedSerieTreeService = new SavedSerieTreeService( {
      serieRepository,
      episodeRepository,
    } );
  }

  async endpoint(req: Request, res: Response) {
    const {MEDIA_FOLDER_PATH} = process.env;

    assertIsDefined(MEDIA_FOLDER_PATH);

    const errors: ErrorElementResponse[] = [];
    const filesSerieTreeResult = findAllSerieFolderTreesAt(path.join(MEDIA_FOLDER_PATH, "series"), {
      baseFolder: "series/",
    } );

    if (filesSerieTreeResult.errors)
      errors.push(...filesSerieTreeResult.errors);

    const savedSerieTree = await this.#savedSerieTreeService.getSavedSeriesTree();
    const diff = diffSerieTree(savedSerieTree,
      {
        children: filesSerieTreeResult.data,
      } );

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
    const responseObj: FullResponse<typeof data> = {
      errors,
      data,
    };

    res.send(responseObj);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.endpoint.bind(this));

    return router;
  }

  async #updateEpisodes(oldNew: OldNew[]): Promise<Episode[]> {
    if (oldNew.length === 0)
      return [];

    const promises: Promise<Episode | null>[] = [];

    for (const entry of oldNew) {
      const p: Promise<Episode | null> = this.#episodeRepository.patchOneByPathAndGet(entry.old.content.filePath, {
        episodeId: entry.new.content.episodeId,
        path: entry.new.content.filePath,
      } );

      promises.push(p);
    }

    const all = await Promise.all(promises);
    const allNotNull = all.filter(e => e !== null) as Episode[];

    return allNotNull;
  }

  async #saveNewEpisodes(seriesInTree: Serie[]): Promise<Episode[]> {
    const episodes: Episode[] = [];

    for (const serieInTree of seriesInTree) {
      let serie = await this.#serieRepository.getOneByIdOrCreate(serieInTree.id);

      if (!serie) {
        serie = await this.#serieRepository.createOneAndGet( {
          name: serieInTree.id,
          id: serieInTree.id,
        } );
      }

      for (const seasonInTree of serieInTree.children) {
        for (const episodeInTree of seasonInTree.children) {
          const episode: Episode = {
            episodeId: episodeInTree.content.episodeId,
            path: episodeInTree.content.filePath,
            end: -1,
            serieId: serie.id,
            start: -1,
            title: `${serie.name} ${episodeInTree.content.episodeId}`,
            weight: 0,
          };

          episodes.push(episode);
        }
      }
    }

    await this.#episodeRepository.createManyAndGet(episodes);

    return episodes;
  }
}
