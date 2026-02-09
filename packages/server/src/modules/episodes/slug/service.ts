import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { ResponseFormat } from "$shared/models/resources";
import { assertFoundClient } from "#utils/validation/found";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { EpisodesCrudDtos } from "#episodes/models/dto";
import { } from "#modules/resources/response-formatter";
import { EpisodeResponseFormatterService } from "#episodes/renderer/formatter.service";
import { EpisodeEntity } from "../models";

@Injectable()
export class EpisodeSlugHandlerService {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
    private readonly responseFormatter: EpisodeResponseFormatterService,
  ) {}

  getFormat(req: Request) {
    return this.responseFormatter.getResponseFormatByRequest(req);
  }

  async fetchEpisodeByFormat(params: {
    seriesKey: string;
    episodeKey: string;
    format: ResponseFormat;
    userId: string | null;
  } ): Promise<EpisodeEntity> {
    const expandCriteria = this.buildExpandCriteria(params.format, params.userId);
    const episode = await this.episodesRepo.getOneBySlug(
      params.seriesKey,
      params.episodeKey,
      expandCriteria,
      {
        requestingUserId: params.userId ?? undefined,
      },
    );

    assertFoundClient(episode);

    return episode;
  }

  private buildExpandCriteria(format: ResponseFormat, userId: string | null) {
    const expand: NonNullable<EpisodesCrudDtos.GetOne.Criteria["expand"]> = [];

    if (format === ResponseFormat.M3U8 || format === ResponseFormat.RAW)
      expand.push("fileInfos");

    expand.push("series");

    if (userId)
      expand.push("userInfo");

    return {
      expand,
    };
  }
}
