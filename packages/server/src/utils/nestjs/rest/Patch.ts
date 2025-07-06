import { applyDecorators, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { z } from "zod";
import { ZodSerializerSchema } from "#utils/validation/zod-nestjs";

type PatchOneByIdOptions = {
  get?: {
    schema: z.ZodSchema;
  };
};
export function PatchOne(url: string, options?: PatchOneByIdOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [Patch(url)];
  const schema = options?.get?.schema ?? z.undefined();

  decorators.push(
    ZodSerializerSchema(schema),
  );

  if (schema === z.undefined()) {
    decorators.push(
      HttpCode(HttpStatus.NO_CONTENT),
    );
  } else {
    decorators.push(
      HttpCode(HttpStatus.OK),
    );
  }

  return applyDecorators(...decorators);
}
