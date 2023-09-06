import { HistoryListGetManyEntriesBySuperIdSchema, HistoryListGetManyEntriesSchema, HistoryListGetOneByIdSchema } from "#shared/models/historyLists";
import { validateRequest } from "#utils/validation/zod-express";

export const getOneByIdValidation = validateRequest(HistoryListGetOneByIdSchema);

export const getManyEntriesBySuperIdValidation = validateRequest(HistoryListGetManyEntriesBySuperIdSchema);

export const getManyEntriesValidation = validateRequest(HistoryListGetManyEntriesSchema);