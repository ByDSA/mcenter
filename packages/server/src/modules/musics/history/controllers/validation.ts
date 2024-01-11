/* eslint-disable import/prefer-default-export */
import { assertIsHistoryMusicListGetManyEntriesBySearchRequest } from "#shared/models/musics";
import { validateRequest } from "#utils/validation/zod-express";

export const getManyEntriesBySearchValidation = validateRequest(assertIsHistoryMusicListGetManyEntriesBySearchRequest);
