import z from "zod";

export const positiveOrZeroSchema = z.number()
  .gte(0);

export const timeRangeSchema = z.object( {
  start: positiveOrZeroSchema.optional(),
  end: positiveOrZeroSchema.optional(),
} );

export type TimeRange = z.infer<typeof timeRangeSchema>;

export const taggableSchema = z.object( {
  tags: z.array(z.string()).optional(),
} );

export type Taggable = z.infer<typeof taggableSchema>;

export const mongoDbIdRefining = [
  ((id: any) => /^[a-f0-9]{24}$/.test(id)),
  {
    message: "id must be a mongodb id",
  },
] as const;

export const mongoDbId = z.string()
  .refine(...mongoDbIdRefining);
