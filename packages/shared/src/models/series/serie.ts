import z from "zod";
import { genAssertZod } from "../../utils/validation/zod";
import { mongoDbId } from "../resources/partial-schemas";
import { imageCoverEntitySchema } from "../image-covers";

const seriesKeySchema = z.string();

type SeriesKey = z.infer<typeof seriesKeySchema>;

export const serieSchema = z.object( {
  name: z.string(),
  key: seriesKeySchema,
  imageCoverId: mongoDbId.nullable(),
} ).strict();

export type Serie = z.infer<typeof serieSchema>;

export const assertIsSerie = genAssertZod(serieSchema);

export const serieEntitySchema = serieSchema.extend( {
  id: mongoDbId,
  imageCover: imageCoverEntitySchema.optional(),
} );

export type SerieEntity = z.infer<typeof serieEntitySchema>;

export const assertIsSerieEntity = genAssertZod(serieEntitySchema);

export {
  type SeriesKey,
  seriesKeySchema,
};
