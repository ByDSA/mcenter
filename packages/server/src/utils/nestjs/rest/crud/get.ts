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
import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "$shared/routing";
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
  url?: string;
};
export function GetOneById(schema: z.ZodSchema, options?: GetOneOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Get(options?.url ?? "/:id"),
    // los interceptors se ejecutan al revés:
    UseInterceptors(ResponseFormatterInterceptor, DataNotFoundOnNullInterceptor),
    ValidateResponseWithZodSchema(createOneResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}

type GetManyOptions = {
  url?: string;
};

export function GetAll(schema: z.ZodSchema, options?: GetManyOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Get(options?.url ?? "/"),
    UseInterceptors(ResponseFormatterInterceptor),
    ValidateResponseWithZodSchema(createManyResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}

export function GetMany(url: string, schema: z.ZodSchema, options?: Omit<GetManyOptions, "url">) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    GetAll(schema, {
      url,
      ...options,
    } ),
  ];

  return applyDecorators(...decorators);
}
type GetManyCriteriaOptions = {
  url?: string;
  metadataSchema?: z.ZodObject<any>;
};
export function GetManyCriteria(
  schema: z.ZodSchema,
  options?: GetManyCriteriaOptions,
) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Post(options?.url ?? GET_MANY_CRITERIA_PATH),
    UseInterceptors(ResponseFormatterInterceptor),
    ValidateResponseWithZodSchema(
      createPaginatedResultResponseSchema(schema, options?.metadataSchema),
    ),
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
    Post(options?.url ?? GET_ONE_CRITERIA_PATH),
    UseInterceptors(ResponseFormatterInterceptor),
    ValidateResponseWithZodSchema(createOneResultResponseSchema(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}
