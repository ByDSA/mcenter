import { deleteOneEntryById } from "./rest/delete-one-entry-by-id";
import { criteriaSchema, getManyEntriesByCriteria } from "./rest/get-many-entries-by-criteria";
import { getManyEntriesBySuperId } from "./rest/get-many-entries-by-superid";
import { getOneByIdReqParamsSchema } from "./rest/get-one-by-id";

export const historyListRestDto = {
  deleteOneEntryById,
  getManyEntriesByCriteria: {
    ...getManyEntriesByCriteria,
    criteriaSchema,
  },
  getManyEntriesBySuperId,
  getOneByIdReqParamsSchema,
};
