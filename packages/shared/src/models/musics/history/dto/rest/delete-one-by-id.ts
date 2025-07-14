import { deleteOneById as _deleteOneById } from "../../../../utils/schemas/requests/delete-one-by-id";

export const deleteOneById = {
  req:
  {
    paramsSchema: _deleteOneById.reqParamsSchema,
  },
};
