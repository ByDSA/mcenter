import { applyDecorators, Delete } from "@nestjs/common";
import z from "zod";
import { getCommonCommandDecorators } from "./Patch";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";

export * from "./Get";

export * from "./Patch";

export function DeleteOne(url: string, dataSchema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Delete(url),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}

export function DeleteMany(url: string, schema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [Delete(url)];
  const usingSchema = schema ?? z.undefined();

  decorators.push(
    ValidateResponseWithZodSchema(
      z.array(usingSchema.or(z.undefined())),
    ),
  );

  return applyDecorators(...decorators);
}
