import { applyDecorators, HttpCode, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import z from "zod";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { ResponseFormatterInterceptor } from "../responses/response-formatter.interceptor";
import { DataNotFoundOnNullInterceptor } from "./get";

type PostOneOptions = {
  _: 0;
};
export function PostOne(url: string, schema: z.ZodSchema, _options?: PostOneOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Post(url),
    // los interceptors se ejecutan al revés:
    UseInterceptors(ResponseFormatterInterceptor, DataNotFoundOnNullInterceptor),
    ValidateResponseWithZodSchema(createOneResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}
