import { Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { Reflector } from "@nestjs/core";
import { genM3u8View } from "../m3u8.view";
import { M3U8_FORMAT_USE_NEXT } from "./use-next.decorator";
import { getResponseFormatByRequest, ResponseFormat } from ".";

interface FormatOptions {
  m3u8UseNext?: boolean;
}

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const m3u8UseNext = this.reflector.get<boolean | undefined>(
      M3U8_FORMAT_USE_NEXT,
      context.getHandler(),
    );
    const options: FormatOptions = {
      m3u8UseNext,
    };
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const format = getResponseFormatByRequest(
      request,
    );

    return next.handle().pipe(
      map((data) => {
        return this.formatResponse(data, format, request, response, options);
      } ),
    );
  }

  private formatResponse(
    data: any,
    format: ResponseFormat,
    request: Request,
    response: Response,
    formatOptions?: FormatOptions,
  ) {
    switch (format) {
      case ResponseFormat.M3U8:
      case ResponseFormat.RAW:
      {
        response.setHeader("Content-Type", "application/x-mpegURL");

        const useNext = formatOptions?.m3u8UseNext ?? false;

        return genM3u8View( {
          picked: data,
          req: request,
          useNext,
        } );
      }
      case ResponseFormat.JSON:
      default:
        response.setHeader("Content-Type", "application/json");

        return createSuccessResultResponse(data);
    }
  }
}
