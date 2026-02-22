import { Injectable } from "@nestjs/common";
import { getHostFromRequest } from "$shared/models/resources";
import { Request, Response } from "express";
import { M3u8ViewOptions } from "#modules/resources/response-formatter/resource-to-media-element";
import { StreamFileService } from "#modules/resources/stream-file/service";
import { validateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { assertFoundServer } from "#utils/validation/found";
import { ResponseFormat } from "../../resources/response-formatter";
import { MusicEntity, musicEntitySchema } from "../models";
import { MusicFileInfoEntity } from "../file-info/models";
import { getAbsolutePath } from "../utils";
import { MusicResponseFormatterService } from "./formatter.service";

type Entity = MusicEntity;

type RenderRawProps = {
  music: Entity | null;
  request: Request;
  response: Response;
};

type RenderProps = RenderRawProps & {
  format: ResponseFormat;
};
function getM3u8OptionsFromRequest(req: Request): M3u8ViewOptions {
  const token = (req.query.token as string) || undefined;
  const ret: M3u8ViewOptions = {};

  if (token)
    ret.token = token;

  return ret;
}

@Injectable()
export class MusicRendererService {
  constructor(
    private readonly responseFormatter: MusicResponseFormatterService,
    private readonly resourceSlugService: StreamFileService,
  ) { }

  renderM3u8One(
    music: Entity | null,
    req: Request,
    options?: Parameters<typeof this.responseFormatter.formatOneRemoteM3u8Response>[2],
  ) {
    return this.responseFormatter.formatOneRemoteM3u8Response(
      music,
      getHostFromRequest(req),
      {
        ...getM3u8OptionsFromRequest(req),
        ...options,
      },
    );
  }

  renderM3u8Many(musics: MusicEntity[], req: Request) {
    return this.responseFormatter.formatManyRemoteM3u8Response(
      musics,
      getHostFromRequest(req),
      getM3u8OptionsFromRequest(req),
    );
  }

  renderJson(music: Entity | null, req: Request, res: Response) {
    if (!music) {
      return {
        data: null,
      };
    }

    const json = this.responseFormatter.formatOneJsonResponse(music, res);

    validateResponseWithZodSchema(json.data, musicEntitySchema, req);

    return json;
  }

  async render( { format,
    music,
    request,
    response }: RenderProps) {
    switch (format) {
      case ResponseFormat.M3U8:
        return this.renderM3u8One(music, request);
      case ResponseFormat.RAW:
      {
        return await this.renderRaw( {
          music,
          request,
          response,
        } );
      }
      case ResponseFormat.JSON:
        return this.renderJson(music, request, response);
    }
  }

  async renderRaw( { music, request, response }: RenderRawProps) {
    if (!music) {
      response.status(204).send();

      return;
    }

    assertFoundServer(music.fileInfos);
    const fileInfo = music.fileInfos.find(f=>!f.offloaded);

    assertFoundServer(fileInfo);

    assertFoundServer(fileInfo);
    const fullpath = getAbsolutePath(fileInfo.path);

    return await this.resourceSlugService.handle( {
      req: request,
      res: response,
      fullpath,
      customFilename: generateFilename(music, fileInfo),
      lastModified: music.updatedAt,
      size: fileInfo.size,
    } );
  }
}

const generateFilename = (entity: MusicEntity, fileInfo: MusicFileInfoEntity) => {
  const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));

  return `${entity.artist} - ${entity.title}${ext}`;
};
