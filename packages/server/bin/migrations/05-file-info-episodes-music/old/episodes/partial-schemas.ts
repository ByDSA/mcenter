import z from "zod";

export const positiveOrZeroSchema = z.number()
  .gte(0);

export const timeRangeSchema = z.object( {
  start: positiveOrZeroSchema.optional(),
  end: positiveOrZeroSchema.optional(),
} );

export type TimeRange = z.infer<typeof timeRangeSchema>;

export const localFileSchema = z.object( {
  path: z.string(),
} );

export type LocalFile = z.infer<typeof localFileSchema>;

export const pickableSchema = z.object( {
  weight: z.number(),
} );

export type Pickable = z.infer<typeof pickableSchema>;

export const taggableSchema = z.object( {
  tags: z.array(z.string()).optional(),
} );

export type Taggable = z.infer<typeof taggableSchema>;
