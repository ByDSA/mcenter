import { Injectable } from "@nestjs/common";
import { getHostFromRequest } from "$shared/models/resources/m3u8.view";
import { Request, Response } from "express";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { assertFoundServer } from "#utils/validation/found";
import { getAbsolutePath } from "../utils";
import { ResponseFormat, EpisodeResponseFormatterService } from "../../resources/response-formatter";

type Entity = EpisodeEntity;

type RenderProps = {
  episode: Entity;
  format: ResponseFormat;
  request: Request;
  response: Response;
};

@Injectable()
export class EpisodeRendererService {
  constructor(
    private readonly responseFormatter: EpisodeResponseFormatterService,
    private readonly resourceSlugService: ResourceSlugService,
  ) { }

  renderM3u8One(episode: Entity, seriesName: string, req: Request) {
    return this.responseFormatter.formatOneRemoteM3u8Response(
      episode,
      seriesName,
      getHostFromRequest(req),
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
    const json = this.responseFormatter.formatOneJsonResponse(episode!, res);

    validateResponseWithZodSchema(json.data, episodeEntitySchema, req);

    return json;
  }

  render( { format,
    episode,
    request: req,
    response: res }: RenderProps) {
    switch (format) {
      case ResponseFormat.M3U8:
        assertFoundServer(episode.series);

        return this.renderM3u8One(episode, episode.series.name, req);
      case ResponseFormat.RAW:
      {
        return this.resourceSlugService.handle( {
          entity: episode,
          req,
          res,
          getAbsolutePath,
          generateFilename: (entity: Entity, fileInfo: EpisodeFileInfoEntity) => {
            const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));

            assertFoundServer(entity.series);
            const series = entity.series?.name;
            const { episodeKey } = entity;

            return `${series} - ${episodeKey} - ${entity.title}${ext}`;
          },
        } );
      }
      case ResponseFormat.JSON:
        return this.renderJson(episode, req, res);
    }
  }
}
