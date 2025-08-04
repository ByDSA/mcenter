import { applyDecorators, HttpCode, HttpStatus, Patch, UseInterceptors } from "@nestjs/common";
import z from "zod";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { ResponseFormatterInterceptor } from "../responses/response-formatter.interceptor";

const UNDEFINED_SCHEMA = z.undefined();

export function PatchOne(url: string, dataSchema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Patch(url),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}

export function getCommonCommandDecorators(dataSchema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    UseInterceptors(ResponseFormatterInterceptor),
    ...getOptionalResponseDecorators(dataSchema),
  ];

  return decorators;
}

export function getOptionalResponseDecorators(dataSchema?: z.ZodSchema) {
  const usingSchema = dataSchema ?? UNDEFINED_SCHEMA;
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [];

  if (usingSchema === UNDEFINED_SCHEMA) {
    decorators.push(
      ValidateResponseWithZodSchema(usingSchema),
      HttpCode(HttpStatus.NO_CONTENT),
    );
  } else {
    decorators.push(
      ValidateResponseWithZodSchema(createOneResultResponseSchema(usingSchema)),
      HttpCode(HttpStatus.OK),
    );
  }

  return decorators;
}
