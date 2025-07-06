import { z } from "zod";

const paramsSchema = z.object( {
  id: z.string( {
    // eslint-disable-next-line camelcase
    required_error: "id is required",
  } ),
} );

type ParamsType = z.infer<typeof paramsSchema>;

export {
  paramsSchema,
  type ParamsType,
};
