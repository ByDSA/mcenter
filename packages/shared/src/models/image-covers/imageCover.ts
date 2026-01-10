import z from "zod";
import { genAssertZod } from "../../utils/validation/zod";
import { autoTimestampsSchema } from "../utils/schemas/timestamps";
import { mongoDbId } from "../resources/partial-schemas";

const idSchema = z.string();

type Id = z.infer<typeof idSchema>;

const modelSchema = z.object( {
  metadata: z.object( {
    label: z.string(),
  } ),
  versions: z.object( {
    original: z.string(),
    large: z.string().optional(),
    medium: z.string().optional(),
    small: z.string().optional(),
  } ),
  uploaderUserId: mongoDbId,
} ).merge(autoTimestampsSchema);

type Model = z.infer<typeof modelSchema>;

const entitySchema = modelSchema.extend( {
  id: idSchema,
} );

type Entity = z.infer<typeof entitySchema>;

function compareId(a: Id, b: Id): boolean {
  return a === b;
}

const assertIsModel = genAssertZod(modelSchema);
const assertIsEntity = genAssertZod(entitySchema);

export {
  idSchema as imageCoverIdSchema,
  entitySchema as imageCoverEntitySchema,
  Entity as ImageCoverEntity,
  Id as ImageCoverId,
  modelSchema as imageCoverSchema,
  Model as ImageCover,
  assertIsModel as assertIsImageCover,
  assertIsEntity as assertIsImageCoverEntity,
  compareId as compareImageCoverId,
};
