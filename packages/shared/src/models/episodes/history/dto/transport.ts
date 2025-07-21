import z from "zod";

export namespace EpisodeHistoryEntryRestDtos {
  export namespace GetManyByCriteria {
export const criteriaSchema = z.object( {
  filter: z.object( {
    seriesKey: z.string().optional(),
    episodeKey: z.string().optional(),
    timestampMax: z.number().optional(),
  } ).strict()
    .optional(),
  sort: z.object( {
    timestamp: z.enum(["asc", "desc"]).optional(),
  } ).strict()
    .optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  expand: z.array(z.enum(["series", "episodes", "episode-file-infos"])).optional(),
} ).strict();
export type Criteria = z.infer<typeof criteriaSchema>;
export const bodySchema = criteriaSchema.default( {} );
  }
};
