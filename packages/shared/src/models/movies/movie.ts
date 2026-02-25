import z from "zod";
import { slugSchema } from "../utils/schemas/slug";
import { mongoDbId } from "../resources/partial-schemas";
import { imageCoverEntitySchema } from "../image-covers";
import { resourceSchema } from "../resources";
import { movieFileInfoEntitySchema } from "./file-info";

const idSchema = z.string();

type Id = z.infer<typeof idSchema>;

const entitySchema = z.object( {
  id: idSchema,
  title: z.string(), // TODO: mover a resourceSchema
  slug: slugSchema, // TODO: mover a resourceSchema
  year: z.number().int()
    .optional(),
  genre: z.array(z.string()),
  director: z.string().optional(),
  synopsis: z.string().optional(),
  duration: z.number().int()
    .optional(), // minutes
  imageCoverId: mongoDbId.optional(), // TODO: mover a resourceSchema
  imageCover: imageCoverEntitySchema.optional(),
  fileInfos: z.array(movieFileInfoEntitySchema).optional(),
} ).merge(resourceSchema);

type Entity = z.infer<typeof entitySchema>;

export {
  idSchema as movieIdSchema,
  entitySchema as movieEntitySchema,
  Entity as MovieEntity,
  Id as MovieId,
};
