import { Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  applyDecorators,
  SetMetadata, UseInterceptors } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";
import { Reflector } from "@nestjs/core";
import { episodeEntitySchema } from "#episodes/models";
import { M3U8_FORMAT_USE_NEXT } from "../../resources/response-formatter/use-next.decorator";
import { EpisodeResponseFormatterService, FormatResponseOptions } from "./formatter.service";
import { EpisodeRendererService } from "./renderer.service";

@Injectable()
export class EpisodeRendererInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly responseFormatter: EpisodeResponseFormatterService,
    private readonly renderer: EpisodeRendererService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const m3u8UseNext = this.reflector.get<boolean | undefined>(
      M3U8_FORMAT_USE_NEXT,
      context.getHandler(),
    );
    const props = this.reflector.get<RenderEpisodeDecoratorProps | undefined>(
      EPISODE_RENDERER_KEY,
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
      map((data) => {
        switch (format) {
          case "m3u8": {
            if (!props?.m3u8)
              throw new Error("M3U8 format is not enabled for this route");

            const parsedData = episodeEntitySchema.required( {
              series: true,
            } ).parse(data);

            return this.renderer.renderM3u8One(
              parsedData,
              parsedData.series.name,
              request,
              options,
            );
          }
          case "json":
            if (!props?.json)
              throw new Error("JSON format is not enabled for this route");

            return this.renderer.renderJson(data, request, response);
          case "raw":
          {
            if (!props?.raw)
              throw new Error("RAW format is not enabled for this route");

            const { user } = context.switchToHttp().getRequest();
            const { token } = context.switchToHttp().getRequest().query;

            return this.renderer.renderRaw( {
              episode: episodeEntitySchema.parse(data),
              request,
              response,
              userId: user?.id ?? token ?? null,
            } );
          }
          default:
            throw new Error("Format is not supported");
        }
      } ),
    );
  }
}

const EPISODE_RENDERER_KEY = "EPISODE_RENDERER";

export type RenderEpisodeDecoratorProps = {
  m3u8?: boolean;
  json?: boolean;
  raw?: boolean;
};

export const RenderEpisode = (props?: RenderEpisodeDecoratorProps) => {
  return applyDecorators(
    SetMetadata(EPISODE_RENDERER_KEY, props),
    UseInterceptors(EpisodeRendererInterceptor),
  );
};
