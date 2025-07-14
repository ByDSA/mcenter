import { applyDecorators, Delete } from "@nestjs/common";
import z from "zod";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { getCommonCommandDecorators, PatchOne } from "./Patch";
import { GetOne } from "./Get";

export {
  PatchOne, GetOne,
};

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
