import { Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";
import { Reflector } from "@nestjs/core";
import { M3U8_FORMAT_USE_NEXT } from "./use-next.decorator";
import { EpisodeResponseFormatterService, FormatResponseOptions } from "./episode-response-formatter.service";

@Injectable()
export class EpisodeResponseFormatInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly responseFormatter: EpisodeResponseFormatterService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const m3u8UseNext = this.reflector.get<boolean | undefined>(
      M3U8_FORMAT_USE_NEXT,
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
          case "m3u8":
            return this.responseFormatter.formatM3u8Response( {
              episode: data,
              serieName: "Series Name", // TODO
              request,
              response,
              options,
            } );
          case "json":
            return this.responseFormatter.formatOneJsonResponse(
              data,
              response,
            );
          case "raw":
          default:
            return data;
        }
      } ),
    );
  }
}
