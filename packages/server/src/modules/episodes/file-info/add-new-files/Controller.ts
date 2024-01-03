import { SavedSerieTreeService, SerieRepository } from "#modules/series";
import { ErrorElementResponse, FullResponse, errorToErrorElementResponse } from "#shared/utils/http";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";
import path from "path";
import { Model as Episode } from "../../models";
import { Repository as EpisodeRepository } from "../../repositories";
import { diffSerieTree, findAllSerieFolderTreesAt } from "../tree";
import { OldNew } from "../tree/diff";
import { Serie } from "../tree/models";

const DepsMap = {
  serieRepository: SerieRepository,
  episodeRepository: EpisodeRepository,
  savedSerieTreeService: SavedSerieTreeService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class ThisController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
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

    const savedSerieTree = await this.#deps.savedSerieTreeService.getSavedSeriesTree();
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
      const p: Promise<Episode | null> = this.#deps.episodeRepository.patchOneByPathAndGet(entry.old.content.filePath, {
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

    // TODO: quitar await en for si se puede
    for (const serieInTree of seriesInTree) {
      let serie = await this.#deps.serieRepository.getOneById(serieInTree.id);

      if (!serie) {
        serie = await this.#deps.serieRepository.createOneAndGet( {
          name: serieInTree.id,
          id: serieInTree.id,
        } );
      }

      for (const seasonInTree of serieInTree.children) {
        for (const episodeInTree of seasonInTree.children) {
          const episode: Episode = {
            id: {
              innerId: episodeInTree.content.episodeId,
              serieId: serie.id,
            },
            path: episodeInTree.content.filePath,
            end: -1,
            start: -1,
            title: `${serie.name} ${episodeInTree.content.episodeId}`,
            weight: 0,
          };

          episodes.push(episode);
        }
      }
    }

    await this.#deps.episodeRepository.createManyAndGet(episodes);

    return episodes;
  }
}
