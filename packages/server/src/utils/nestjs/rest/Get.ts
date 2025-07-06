import { applyDecorators, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodSerializerSchema } from "#utils/validation/zod-nestjs";

type GetOneOptions = {
  _: 0;
};
export function GetOne(url: string, schema: z.ZodSchema, _options?: GetOneOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Get(url),
    ZodSerializerSchema(schema.or(z.null())),
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
    ZodSerializerSchema(z.array(schema)),
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
    ZodSerializerSchema(z.array(schema)),
    HttpCode(HttpStatus.OK),
  ];

  return applyDecorators(...decorators);
}
