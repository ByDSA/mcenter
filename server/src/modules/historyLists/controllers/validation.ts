import { validateRequest } from "#utils/validation/zod-express";
import { z } from "zod";

const getOneByIdSchema = z.object( {
  params: z.object( {
    id: z.string( {
      required_error: "id is required",
    } ),
  } ),
} );

export type GetOneByIdRequest = z.infer<typeof getOneByIdSchema>;

export const getOneByIdValidation = validateRequest(getOneByIdSchema);