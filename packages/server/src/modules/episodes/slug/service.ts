import { Injectable, StreamableFile } from "@nestjs/common";
import { Request, Response } from "express";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { getAbsolutePath } from "#episodes/utils";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodeEntity } from "../models";
import { EpisodeHistoryRepository } from "../history/crud/repository";

type Slug = {
  seriesKey: string;
  episodeKey: string;
};
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
    const episode = await this.repo.getOneBySeriesKeyAndEpisodeKey(
      slug.seriesKey,
      slug.episodeKey,
      {
        expand: ["fileInfos", "series"],
      },
      {
        requestingUserId: userId,
      },
    );

    assertFoundClient(episode);
    assertFoundServer(episode.fileInfos);
    assertFoundServer(episode.series);

    if (userId)
      await this.updateHistory(episode, userId);

    return this.resourceSlugService.handle( {
      entity: episode,
      req,
      res,
      getAbsolutePath,
      generateFilename: (entity: EpisodeEntity, fileInfo: EpisodeFileInfoEntity) => {
        const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));

        assertFoundServer(entity.series);
        const series = entity.series.name;
        const { episodeKey } = entity;

        return `${series} - ${episodeKey} - ${entity.title}${ext}`;
      },
    } );
  }

  private async updateHistory(episode: EpisodeEntity, userId: string) {
    const options = {
      requestingUserId: userId,
    };
    const isLast = await this.historyRepo.isLast(episode.id, options);

    if (!isLast) {
      await this.historyRepo.createNewEntryNowFor( {
        episodeId: episode.id,
        seriesId: episode.seriesId,
      }, options);
    }
  }
}
