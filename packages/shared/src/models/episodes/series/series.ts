import z from "zod";
import { mongoDbId } from "../../resources/partial-schemas";
import { imageCoverEntitySchema } from "../../image-covers";
import { timestampsSchema } from "../../utils/schemas/timestamps";
import { EpisodeEntity } from "../episode";

const seriesKeySchema = z.string();

type SeriesKey = z.infer<typeof seriesKeySchema>;

export const seriesSchema = z.object( {
  name: z.string(),
  key: seriesKeySchema,
  imageCoverId: mongoDbId.nullable(),
} )
  .merge(timestampsSchema)
  .strict();

export type Series = z.infer<typeof seriesSchema>;

export const seriesEntitySchema = seriesSchema.extend( {
  id: mongoDbId,
  imageCover: imageCoverEntitySchema.optional(),
  metadata: z.object( {
    countEpisodes: z.number().optional(),
    countSeasons: z.number().optional(),
  } ).optional(),
} );

export type SeriesEntity = z.infer<typeof seriesEntitySchema>;

export type SeriesSeasons = Record<string, EpisodeEntity[]>;

export {
  type SeriesKey,
  seriesKeySchema,
};
