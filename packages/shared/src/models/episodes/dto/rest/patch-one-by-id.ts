import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { episodeEntitySchema } from "../../episode";
import { getOneById } from "./get-one-by-id";

export const patchOneById = {
  reqBodySchema: generatePatchBodySchema(episodeEntitySchema),
  reqParamsSchema: getOneById.paramsSchema,
};
