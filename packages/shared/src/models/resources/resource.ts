import z from "zod";
import { genAssertZod } from "../../utils/validation/zod";
import { timestampsSchema } from "../utils/schemas/timestamps";
import { mongoDbId, taggableSchema } from "./partial-schemas";

const modelSchema = z.object( {
  title: z.string(),
  disabled: z.boolean().optional(),
  uploaderUserId: mongoDbId,
} )
  .merge(timestampsSchema)
  .merge(taggableSchema);

type Model = z.infer<typeof modelSchema>;

const assertIsModel = genAssertZod(modelSchema);
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
