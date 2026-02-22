import { Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  applyDecorators,
  SetMetadata,
  UseInterceptors } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";
import { Reflector } from "@nestjs/core";
import { FormatResponseOptions } from "../../episodes/renderer/formatter.service";
import { M3U8_FORMAT_USE_NEXT } from "../../resources/response-formatter/use-next.decorator";
import { MusicEntity } from "../models";
import { MusicResponseFormatterService } from "./formatter.service";
import { MusicRendererService } from "./renderer.service";

@Injectable()
export class MusicRendererInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly responseFormatter: MusicResponseFormatterService,
    private readonly renderer: MusicRendererService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const m3u8UseNext = this.reflector.get<boolean | undefined>(
      M3U8_FORMAT_USE_NEXT,
      context.getHandler(),
    );
    const props = this.reflector.get<RenderMusicDecoratorProps | undefined>(
      MUSIC_RENDERER_KEY,
      context.getHandler(),
    );
    const options: FormatResponseOptions = {
      m3u8UseNext,
      local: false,
    };
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const format = this.responseFormatter.getResponseFormatByRequest(request);

    return next.handle().pipe(
      map((data: MusicEntity | null) => {
        switch (format) {
          case "m3u8":
            if (!props?.m3u8)
              throw new Error("M3U8 format is not enabled for this route");

            return this.renderer.renderM3u8One(data, request, options);
          case "json":
            if (!props?.json)
              throw new Error("JSON format is not enabled for this route");

            return this.renderer.renderJson(data, request, response);
          case "raw":
            if (!props?.raw)
              throw new Error("Raw format is not enabled for this route");

            return this.renderer.renderRaw( {
              music: data,
              request,
              response,
            } );
          default:
            throw new Error("Format is not supported");
        }
      } ),
    );
  }
}

const MUSIC_RENDERER_KEY = "MUSIC_RENDERER";

export type RenderMusicDecoratorProps = {
  m3u8?: boolean;
  json?: boolean;
  raw?: boolean;
};

export const RenderMusic = (props?: RenderMusicDecoratorProps) => {
  return applyDecorators(
    SetMetadata(MUSIC_RENDERER_KEY, props),
    UseInterceptors(MusicRendererInterceptor),
  );
};
