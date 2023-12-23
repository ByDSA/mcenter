import { z } from "zod";

export const PositiveOrZeroSchema = z.number()
  .gte(0);

export const TimeRangeSchema = z.object( {
  start: PositiveOrZeroSchema.optional(),
  end: PositiveOrZeroSchema.optional(),
} );

export type TimeRange = z.infer<typeof TimeRangeSchema>;

export const LocalFileSchema = z.object( {
  path: z.string(),
} );

export type LocalFile = z.infer<typeof LocalFileSchema>;

export const PickableSchema = z.object( {
  weight: z.number(),
} );

export type Pickable = z.infer<typeof PickableSchema>;

export const TaggableSchema = z.object( {
  tags: z.array(z.string()).optional(),
} );

export type Taggable = z.infer<typeof TaggableSchema>;