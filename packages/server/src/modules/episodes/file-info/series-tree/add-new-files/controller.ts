import { Controller, Get } from "@nestjs/common";
import { safeOneConcurrent, safeSequential } from "$shared/utils/errors";
import { ResultResponse } from "$shared/utils/http/responses";
import { EpisodesRepository } from "../../../crud/repository";
import { RemoteSeriesTreeService } from "../remote";
import { AddNewFilesRepository } from "./repository";
import { diffSerieTree as diffSeriesTree, EpisodeFileInfoRepository, OldNewSerieTree as OldNew } from "#episodes/file-info";
import { SeriesRepository } from "#modules/series/crud/repository";
import { SerieNode, SerieTree, EpisodeNode } from "#episodes/file-info/series-tree/local/models";
import { EpisodeFileInfo, EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { UpdateMetadataProcess } from "#episodes/file-info/update/update-saved-process";
import { Serie } from "#modules/series";

@Controller("/admin/add-new-files")
export class EpisodeAddNewFilesController {
  constructor(
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly savedSerieTreeService: RemoteSeriesTreeService,
    private readonly fileInfoRepo: EpisodeFileInfoRepository,
    private readonly updateMetadataProcess: UpdateMetadataProcess,
    private readonly repo: AddNewFilesRepository,
  ) {
  }

  @Get("/")
  async syncLocalToRemote() {
    let localSeriesTree: SerieTree;
    let remoteSeriesTree: SerieTree;
    let diff: ReturnType<typeof diffSeriesTree>;
    let data = {
      new: [] as EpisodeFileInfo[],
      updated: [] as EpisodeFileInfo[],
    };
    const { errors } = await safeSequential(
      [
      // 1
        async ()=> {
          localSeriesTree = await this.repo.getLocalSeriesTree();
        },
        // 2
        async () => {
          remoteSeriesTree = await this.savedSerieTreeService.getRemoteSeriesTree();
        },
        // 3
        async () => {
          diff = diffSeriesTree(
            remoteSeriesTree,
            localSeriesTree,
          );

          diff.moved = diff.moved.filter(
            move => move.old.content.filePath !== move.new.content.filePath,
          );

          const savedData = await this.saveNewFileInfosAndEpisode(diff.new.children);

          data.new = savedData;
        },
        // 4
        async ()=> {
          const updatedEpisodesResult = await this.#safeUpdateEpisodes(
            [...diff.updated, ...diff.moved],
          );

          data.updated = updatedEpisodesResult.data;

          return updatedEpisodesResult;
        },
      ],
      {
        stopOnError: true,
      },
    );

    return {
      data,
      errors,
    };
  }

  async #safeUpdateEpisodes(oldNew: OldNew[]): Promise<ResultResponse<EpisodeFileInfoEntity[]>> {
    const got = await safeOneConcurrent(oldNew.map(entry=>()=> {
      return this.fileInfoRepo
        .patchOneByPathAndGet(entry.old.content.filePath, {
          entity: {
            path: entry.new.content.filePath,
          },
        } );
    } ));

    return {
      ...got,
      data: got.data.filter(Boolean) as EpisodeFileInfoEntity[],
    };
  }

  private async saveNewFileInfosAndEpisode(
    seriesNodes: SerieNode[],
  ): Promise<EpisodeFileInfoEntity[]> {
    const allPromises: Promise<EpisodeFileInfoEntity>[] = [];

    // Recopilar todas las promesas para procesarlas en paralelo
    for (const seriesNode of seriesNodes) {
    // Crear la promesa de la serie una vez
      const seriePromise = this.seriesRepo.getOneOrCreate( {
        name: seriesNode.key,
        key: seriesNode.key,
      } );

      // Para cada temporada y episodio, crear las promesas que dependen de la serie
      for (const seasonInTree of seriesNode.children) {
        for (const episodeInTree of seasonInTree.children) {
          const episodePromise = seriePromise.then(
            serie => this.createFileInfoFromLocalEpisode(episodeInTree, serie),
          );

          allPromises.push(episodePromise);
        }
      }
    }

    // Un solo await para todas las promesas
    return await Promise.all(allPromises);
  }

  private async createFileInfoFromLocalEpisode(localEpisode: EpisodeNode, serie: Serie) {
    const episode = {
      compKey: {
        episodeKey: localEpisode.content.episodeKey,
        seriesKey: serie.key,
      },
      title: `${serie.name} ${localEpisode.content.episodeKey}`,
      weight: 0,
    };
    const gotEpisode = await this.episodesRepo.getOneOrCreate(episode);
    const fileInfo: EpisodeFileInfo = {
      ...await this.updateMetadataProcess.episodeFileToFileInfoOmitEpisodeId(localEpisode),
      episodeId: gotEpisode.id,
    };
    const gotFileInfo = await this.fileInfoRepo.createOneAndGet(fileInfo);

    return gotFileInfo;
  }
}
