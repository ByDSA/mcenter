import { assertIsHistoryListGetManyEntriesBySearchRequest, assertIsHistoryListGetManyEntriesBySuperIdRequest, assertIsHistoryListGetOneByIdRequest } from "#shared/models/historyLists";
import { validateRequest } from "#utils/validation/zod-express";

export const getOneByIdValidation = validateRequest(assertIsHistoryListGetOneByIdRequest);

export const getManyEntriesBySuperIdValidation = validateRequest(assertIsHistoryListGetManyEntriesBySuperIdRequest);

export const getManyEntriesBySearchValidation = validateRequest(assertIsHistoryListGetManyEntriesBySearchRequest);