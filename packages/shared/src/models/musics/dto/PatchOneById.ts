import z from "zod";
import { generatePatchBodySchema } from "../../utils/schemas/patch";
import { entitySchema } from "../Entity";
import { getOneById } from "./GetOneByIdReq";

const reqBodySchema = generatePatchBodySchema(entitySchema);
const resSchema = z.undefined();

export const patchOneById = {
  reqBodySchema,
  reqParamsSchema: getOneById.paramsSchema,
  resSchema,
};
