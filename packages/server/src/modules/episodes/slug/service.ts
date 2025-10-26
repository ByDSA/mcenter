import { Injectable, StreamableFile } from "@nestjs/common";
import { Request, Response } from "express";
import { assertFoundClient } from "#utils/validation/found";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { getAbsolutePath } from "#episodes/utils";
import { EpisodeHistoryRepository } from "../history/crud/repository";
import { EpisodeEntity } from "../models";
import { EpisodesRepository } from "../crud/repositories/episodes";

type Slug = EpisodeEntity["compKey"];
type HandleProps = {
  slug: Slug;
  userId?: string;
  req: Request;
  res: Response;
};
@Injectable()
export class EpisodeSlugHandlerService {
  constructor(
    private readonly repo: EpisodesRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly resourceSlugService: ResourceSlugService,
  ) {}

  async handle( { req, res, slug, userId }: HandleProps): Promise<StreamableFile | void> {
    const episode = await this.repo.getOneByCompKey(slug, {
      expand: ["file-infos", "series"],
    } );

    assertFoundClient(episode);

    if (userId)
      await this.updateHistory(episode, userId);

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

  private async updateHistory(episode: EpisodeEntity, userId: string) {
    const isLast = await this.historyRepo.isLast(episode.id, userId);

    if (!isLast) {
      await this.historyRepo.createNewEntryNowFor( {
        episode,
        userId,
      } );
    }
  }
}
