import { generatePatchBodySchema } from "../../../utils/schemas/patch";
import { musicEntitySchema } from "../../music";
import { getOneById } from "./get-one-by-id";

const reqBodySchema = generatePatchBodySchema(musicEntitySchema);

export const patchOneById = {
  reqBodySchema,
  reqParamsSchema: getOneById.paramsSchema,
};
