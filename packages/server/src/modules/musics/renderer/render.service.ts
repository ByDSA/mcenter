import { Injectable } from "@nestjs/common";
import { getHostFromRequest } from "$shared/models/resources";
import { Request, Response } from "express";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { ResourceSlugService } from "#modules/resources/slug/service";
import { ResponseFormat, ResponseFormatterService } from "../../resources/response-formatter";
import { MusicEntity, musicEntitySchema } from "../models";
import { MusicFileInfoEntity } from "../file-info/models";
import { getAbsolutePath } from "../utils";

type Entity = MusicEntity;

type RenderProps = {
  music: Entity;
  format: ResponseFormat;
  request: Request;
  response: Response;
};

@Injectable()
export class MusicRendererService {
  constructor(
    private readonly responseFormatter: ResponseFormatterService,
    private readonly resourceSlugService: ResourceSlugService,
  ) { }

  renderM3u8One(music: MusicEntity, req: Request) {
    return this.responseFormatter.formatOneRemoteM3u8Response(
      music,
      getHostFromRequest(req),
    );
  }

  renderM3u8Many(musics: MusicEntity[], req: Request) {
    return this.responseFormatter.formatManyRemoteM3u8Response(
      musics,
      getHostFromRequest(req),
    );
  }

  renderJson(music: MusicEntity, req: Request, res: Response) {
    const json = this.responseFormatter.formatOneJsonResponse(music!, res);

    validateResponseWithZodSchema(json.data, musicEntitySchema, req);

    return json;
  }

  render( { format,
    music,
    request: req,
    response: res }: RenderProps) {
    switch (format) {
      case ResponseFormat.M3U8:
        return this.renderM3u8One(music, req);
      case ResponseFormat.RAW:
      {
        return this.resourceSlugService.handle( {
          entity: music,
          req,
          res,
          getAbsolutePath,
          generateFilename: (entity: MusicEntity, fileInfo: MusicFileInfoEntity) => {
            const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));

            return `${entity.artist} - ${entity.title}${ext}`;
          },
        } );
      }
      case ResponseFormat.JSON:
        return this.renderJson(music, req, res);
    }
  }
}
