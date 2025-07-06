import { applyDecorators, Delete } from "@nestjs/common";
import { z } from "zod";
import { ZodSerializerSchema } from "#utils/validation/zod-nestjs";
import { PatchOne } from "./Patch";
import { GetOne } from "./Get";

export {
  PatchOne, GetOne,
};

export function DeleteOne(url: string, schema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [Delete(url)];
  const usingSchema = schema ?? z.undefined();

  decorators.push(
    ZodSerializerSchema(usingSchema.or(z.undefined())),
  );

  return applyDecorators(...decorators);
}

export function DeleteMany(url: string, schema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [Delete(url)];
  const usingSchema = schema ?? z.undefined();

  decorators.push(
    ZodSerializerSchema(
      z.array(usingSchema.or(z.undefined())),
    ),
  );

  return applyDecorators(...decorators);
}
