import { applyDecorators, Post } from "@nestjs/common";
import z from "zod";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { getCommonCommandDecorators } from "./patch";

type PostOneOptions = {
  _: 0;
};
export function PostOne(url: string, dataSchema: z.ZodSchema, _options?: PostOneOptions) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Post(url),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}

export function UserPost(url: string, dataSchema?: z.ZodSchema) {
  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    Authenticated(),
    Post(url),
    ...getCommonCommandDecorators(dataSchema),
  ];

  return applyDecorators(...decorators);
}
