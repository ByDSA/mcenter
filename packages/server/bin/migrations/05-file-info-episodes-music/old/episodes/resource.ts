import z from "zod";
import { assertZodPopStack } from "$shared/utils/validation/zod";
import { timestampsSchema } from "$shared/models/utils/schemas/timestamps";
import { localFileSchema, pickableSchema, taggableSchema } from "./partial-schemas";

const modelSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  lastTimePlayed: z.number().optional(),
  timestamps: timestampsSchema,
} ).merge(localFileSchema)
  .merge(pickableSchema)
  .merge(taggableSchema);

type Model = z.infer<typeof modelSchema>;

function assertIsModel(model: unknown): asserts model is Model {
  assertZodPopStack(modelSchema, model);
}

const entitySchema = modelSchema.extend( {
  id: z.any(),
} );

type Entity = z.infer<typeof entitySchema>;

export {
  modelSchema as resourceSchema,
  assertIsModel as assertIsResource,
  Model as Resource,
  entitySchema as resourceEntitySchema,
  Entity as ResourceEntity,
};
