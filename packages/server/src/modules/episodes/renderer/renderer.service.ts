import { Injectable } from "@nestjs/common";
import { getHostFromRequest } from "$shared/models/resources/m3u8.view";
import { Request, Response } from "express";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { StreamFileService } from "#modules/resources/stream-file/service";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { getAbsolutePath } from "../utils";
import { ResponseFormat } from "../../resources/response-formatter";
import { EpisodeResponseFormatterService } from "./formatter.service";

type Entity = EpisodeEntity;

type RenderRawProps = {
  episode: Entity;
  userId: string | null;
  request: Request;
  response: Response;
};

type RenderProps = RenderRawProps & {
  format: ResponseFormat;
};

@Injectable()
export class EpisodeRendererService {
  constructor(
    private readonly responseFormatter: EpisodeResponseFormatterService,
    private readonly streamFileService: StreamFileService,
    private readonly historyRepo: EpisodeHistoryRepository,
  ) { }

  renderM3u8One(
    episode: Entity,
    seriesName: string,
    req: Request,
    options?: Parameters<typeof this.responseFormatter.formatOneRemoteM3u8Response>[3],
  ) {
    return this.responseFormatter.formatOneRemoteM3u8Response(
      episode,
      seriesName,
      getHostFromRequest(req),
      options,
    );
  }

  renderM3u8Many(data: {episode: Entity;
seriesName: string;}[], req: Request) {
    return this.responseFormatter.formatManyRemoteM3u8Response(
      data,
      getHostFromRequest(req),
    );
  }

  renderJson(episode: Entity, req: Request, res: Response) {
    validateResponseWithZodSchema(episode, episodeEntitySchema, req);

    res.setHeader("Content-Type", "application/json");

    return this.responseFormatter.formatOneJsonResponse(episode);
  }

  async render( { format,
    episode,
    userId,
    request: req,
    response: res }: RenderProps) {
    switch (format) {
      case ResponseFormat.M3U8:
        assertFoundServer(episode.series);

        return this.renderM3u8One(episode, episode.series.name, req);
      case ResponseFormat.RAW:
      {
        return await this.renderRaw( {
          episode,
          userId,
          request: req,
          response: res,
        } );
      }
      case ResponseFormat.JSON:
        return this.renderJson(episode, req, res);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async renderRaw( { episode, request, response, userId }: RenderRawProps) {
    assertFoundClient(episode);
    assertFoundServer(episode.fileInfos);
    assertFoundServer(episode.fileInfos[0]);
    assertFoundServer(episode.series);

    // TODO: debería quitarse de aquí el updateHistory para ser coherente con music
    if (userId)
      await this.updateHistory(episode, userId);

    const fileInfo = episode.fileInfos[0];

    return await this.streamFileService.handle( {
      customFilename: generateFilename(episode, fileInfo),
      req: request,
      res: response,
      fullpath: getAbsolutePath(fileInfo.path),
      lastModified: episode.updatedAt,
      size: fileInfo.size,
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

function generateFilename(entity: EpisodeEntity, fileInfo: EpisodeFileInfoEntity) {
  const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));

  assertFoundServer(entity.series);
  const series = entity.series.name;
  const { episodeKey } = entity;

  return `${series} - ${episodeKey} - ${entity.title}${ext}`;
}
