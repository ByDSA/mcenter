import z from "zod";

const criteriaSchema = z.object( {
  filter: z.object( {
    seriesKey: z.string().optional(),
    episodeKey: z.string().optional(),
  } ).strict()
    .optional(),
  sort: z.object( {
    episodeKey: z.enum(["asc", "desc"]).optional(),
  } ).strict()
    .optional(),
  expand: z.array(z.enum(["fileInfos"])).optional(),
} );

export type Criteria = z.infer<typeof criteriaSchema>;

export type CriteriaOne = Pick<Criteria, "expand" | "filter">;

export function assertIsCriteria(opts?: Criteria) {
  criteriaSchema.parse(opts);
}
