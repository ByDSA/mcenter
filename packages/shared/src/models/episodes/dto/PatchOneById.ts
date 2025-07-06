import z from "zod";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { entitySchema } from "../Entity";
import { getOneById } from "./GetOneById";

export const patchOneById = {
  reqBodySchema: generatePatchBodySchema(entitySchema),
  reqParamsSchema: getOneById.paramsSchema,
  resSchema: z.object( {
    entity: entitySchema.strict().optional(),
  } ).strict(),
};
