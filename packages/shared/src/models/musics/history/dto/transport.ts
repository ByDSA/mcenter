import { getManyEntriesByCriteria } from "./rest/get-many-entries-by-criteria";
import { getOneById } from "./rest/get-one-by-id";
import { deleteOneById } from "./rest/delete-one-by-id";

export const musicHistoryEntryRestDto = {
  getManyEntriesByCriteria,
  getOneById,
  deleteOneEntryById: deleteOneById,
};
