import z from "zod";

export const idParamsSchema = z.object( {
  id: z.string( {
    // eslint-disable-next-line camelcase
    required_error: "id is required",
  } ),
} );

export type IdParamsType = z.infer<typeof idParamsSchema>;
