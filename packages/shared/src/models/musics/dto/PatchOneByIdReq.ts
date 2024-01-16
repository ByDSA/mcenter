import { z } from "zod";
import { generatePatchBody } from "../../utils/dtos";
import { EntitySchema } from "../Entity";
import { Schema as GetOneByIdSchema } from "./GetOneByIdReq";

const BodySchema = generatePatchBody(EntitySchema);

export type BodyType = z.infer<typeof BodySchema>;

export function assertIsBody(o: unknown): asserts o is BodyType {
  BodySchema.parse(o);
}

export const Schema = GetOneByIdSchema.extend( {
  body: BodySchema,
} )
  .required();

export type Type = z.infer<typeof Schema>;

export function assert(o: unknown): asserts o is Type {
  Schema.parse(o);
}