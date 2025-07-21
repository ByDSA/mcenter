import z from "zod";

export const mediaElementSchema = z.object( {
  title: z.string().optional(),
  path: z.string(),
  type: z.enum(["video", "audio"]).optional(),
  startTime: z.number().optional(),
  stopTime: z.number().optional(),
  length: z.number().optional(),
} );

export type MediaElement = z.infer<typeof mediaElementSchema>;
