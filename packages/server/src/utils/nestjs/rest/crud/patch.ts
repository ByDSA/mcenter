import { applyDecorators, HttpCode, HttpStatus, Patch, UseInterceptors } from "@nestjs/common";
import z from "zod";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { ResponseFormatterInterceptor } from "../responses/response-formatter.interceptor";

const UNDEFINED_SCHEMA = z.undefined();

export function AdminPatchOne(url: string, dataSchema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    IsAdmin(),
    Patch(url),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}

export function UserPatchOne(url: string, dataSchema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Authenticated,
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
