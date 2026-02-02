import { applyDecorators, Delete } from "@nestjs/common";
import z from "zod";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { IsAdmin } from "#core/auth/users/roles/Roles.guard";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { getCommonCommandDecorators } from "./patch";

type DeleteOptions = {
  url?: string;
};

export function AdminDeleteOne(dataSchema: z.ZodSchema, deleteOptions?: DeleteOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    IsAdmin(),
    Delete(deleteOptions?.url ?? "/:id"),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}

export function UserDeleteOne(dataSchema: z.ZodSchema, deleteOptions?: DeleteOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Authenticated(),
    Delete(deleteOptions?.url ?? "/:id"),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}

export function AdminDeleteMany(url: string, schema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [Delete(url)];
  const usingSchema = schema ?? z.undefined();

  decorators.push(
    ValidateResponseWithZodSchema(
      z.array(usingSchema.or(z.undefined())),
    ),
  );

  return applyDecorators(...decorators);
}
