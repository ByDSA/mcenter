import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { dateSchema } from "../../utils/schemas/timestamps/date";

const schema = z.object( {
  id: mongoDbId.optional(),
  episodeId: mongoDbId,
  userId: mongoDbId,
  weight: z.number(),
  tags: z.array(z.string()).optional(),
  lastTimePlayed: z.number(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
} );

type Model = z.infer<typeof schema>;

const entitySchema = schema.extend( {
  id: mongoDbId,
} );

type Entity = z.infer<typeof entitySchema>;

export {
  schema as episodeUserInfoSchema,
  type Model as EpisodeUserInfo,
  entitySchema as episodeUserInfoEntitySchema,
  type Entity as EpisodeUserInfoEntity,
};
