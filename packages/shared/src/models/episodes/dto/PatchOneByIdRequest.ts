import { z } from "zod";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { entitySchema } from "../Entity";
import { schema as GetOneByIdSchema } from "./GetOneByIdReq";

const bodySchema = generatePatchBodySchema(entitySchema);

export type BodyType = z.infer<typeof bodySchema>;

export function assertIsBody(o: unknown): asserts o is BodyType {
  bodySchema.parse(o);
}

export const schema = GetOneByIdSchema.extend( {
  body: bodySchema,
} )
  .required();

export type Type = z.infer<typeof schema>;

export function assert(o: unknown): asserts o is Type {
  schema.parse(o);
}
