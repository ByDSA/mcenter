import { applyDecorators, Get, HttpCode, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import z from "zod";
import { Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "$shared/utils/http/responses";
import { createPaginatedResultResponseSchema } from "$shared/utils/http/responses";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { assertFoundClient } from "#utils/validation/found";
import { ResponseFormatterInterceptor } from "../responses/response-formatter.interceptor";

@Injectable()
export class DataNotFoundOnNullInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        assertFoundClient(data);

        return data;
      } ),
    );
  }
}

type GetOneOptions = {
  _: 0;
};
export function GetOne(url: string, schema: z.ZodSchema, _options?: GetOneOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Get(url),
    // los interceptors se ejecutan al revés:
    UseInterceptors(ResponseFormatterInterceptor, DataNotFoundOnNullInterceptor),
    ValidateResponseWithZodSchema(createOneResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}

type GetManyOptions = {
  _: 0;
};

export function GetMany(url: string, schema: z.ZodSchema, _options?: GetManyOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Get(url),
    UseInterceptors(ResponseFormatterInterceptor),
    ValidateResponseWithZodSchema(createManyResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}
type GetManyCriteriaOptions = {
  _: 0;
};

export function GetManyCriteria(
  url: string,
  schema: z.ZodSchema,
  _options?: GetManyCriteriaOptions,
) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Post(url),
    UseInterceptors(ResponseFormatterInterceptor),
    ValidateResponseWithZodSchema(createPaginatedResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}

type GetOneCriteriaOptions = {
  url?: string;
};
export function GetOneCriteria(
  schema: z.ZodSchema,
  options?: GetOneCriteriaOptions,
) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Post(options?.url ?? "search-one"),
    UseInterceptors(ResponseFormatterInterceptor),
    ValidateResponseWithZodSchema(createOneResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}
