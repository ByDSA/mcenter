import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { dateSchema } from "../../utils/schemas/timestamps/date";

const musicUserInfoSchema = z.object( {
  id: mongoDbId.optional(),
  musicId: mongoDbId,
  userId: mongoDbId,
  weight: z.number(),
  tags: z.array(z.string()).optional(),
  lastTimePlayed: z.number(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
} );

type MusicUserInfo = z.infer<typeof musicUserInfoSchema>;

const musicUserInfoEntitySchema = musicUserInfoSchema.extend( {
  id: mongoDbId,
} );

type MusicUserInfoEntity = z.infer<typeof musicUserInfoEntitySchema>;

export {
  musicUserInfoSchema,
  MusicUserInfo,
  musicUserInfoEntitySchema,
  MusicUserInfoEntity,
};
