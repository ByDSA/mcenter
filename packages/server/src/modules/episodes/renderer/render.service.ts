import { Injectable } from "@nestjs/common";
import { getHostFromRequest } from "$shared/models/resources/m3u8.view";
import { Request, Response } from "express";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { EpisodeFileInfoEntity } from "#episodes/file-info/models";
import { ResponseFormat, ResponseFormatterService } from "../../resources/response-formatter";
import { getAbsolutePath } from "../utils";

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
    private readonly responseFormatter: ResponseFormatterService,
    private readonly resourceSlugService: ResourceSlugService,
  ) { }

  renderM3u8One(episode: Entity, req: Request) {
    return this.responseFormatter.formatOneRemoteM3u8Response(
      episode,
      getHostFromRequest(req),
    );
  }

  renderM3u8Many(episodes: Entity[], req: Request) {
    return this.responseFormatter.formatManyRemoteM3u8Response(
      episodes,
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
        return this.renderM3u8One(episode, req);
      case ResponseFormat.RAW:
      {
        return this.resourceSlugService.handle( {
          entity: episode,
          req,
          res,
          getAbsolutePath,
          generateFilename: (entity: Entity, fileInfo: EpisodeFileInfoEntity) => {
            const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));
            const serie = entity.serie?.name ?? entity.compKey.seriesKey;
            const { episodeKey } = entity.compKey;

            return `${serie} - ${episodeKey} - ${entity.title}${ext}`;
          },
        } );
      }
      case ResponseFormat.JSON:
        return this.renderJson(episode, req, res);
    }
  }
}
