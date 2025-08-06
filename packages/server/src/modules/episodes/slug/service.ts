import { Injectable, StreamableFile } from "@nestjs/common";
import { Request, Response } from "express";
import { assertFound } from "#utils/validation/found";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { getAbsolutePath } from "#episodes/utils";
import { EpisodeHistoryRepository } from "../history/crud/repository";
import { EpisodeEntity } from "../models";
import { EpisodesRepository } from "../crud/repository";

type Slug = EpisodeEntity["compKey"];

@Injectable()
export class EpisodeSlugHandlerService {
  constructor(
    private readonly repo: EpisodesRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly resourceSlugService: ResourceSlugService,
  ) {}

  async handle(
    slug: Slug,
    req: Request,
    res: Response,
  ): Promise<StreamableFile | void> {
    const episode = await this.repo.getOneByCompKey(slug, {
      expand: ["fileInfos", "series"],
    } );

    assertFound(episode);

    await this.updateHistory(episode.compKey);

    return this.resourceSlugService.handle( {
      entity: episode,
      req,
      res,
      getAbsolutePath,
      generateFilename: (entity: EpisodeEntity, fileInfo: EpisodeFileInfoEntity) => {
        const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));
        const serie = entity.serie?.name ?? entity.compKey.seriesKey;
        const { episodeKey } = entity.compKey;

        return `${serie} - ${episodeKey} - ${entity.title}${ext}`;
      },
    } );
  }

  private async updateHistory(episodeCompKey: Slug) {
    const isLast = await this.historyRepo.isLast(episodeCompKey);

    if (!isLast) {
      await this.historyRepo.createNewEntryNowFor( {
        episodeCompKey,
      } );
    }
  }
}
