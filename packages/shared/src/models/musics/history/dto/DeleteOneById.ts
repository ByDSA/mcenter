import { deleteOneById as _deleteOneById } from "../../../utils/schemas/requests/DeleteOneById";
import { entrySchema } from "../Entry";

export const deleteOneById = {
  req:
  {
    paramsSchema: _deleteOneById.reqParamsSchema,
  },
  res: {
    bodySchema: _deleteOneById.createDeletedResponseSchema(entrySchema),
  },
};
