import { assertIsEpisodeGetAllRequest, assertIsEpisodeGetManyBySearchRequest, assertIsEpisodeGetOneByIdRequest, assertIsEpisodePatchOneByIdRequest } from "#shared/models/episodes";
import { validateRequest } from "#utils/validation/zod-express";

export const getOneByIdValidation = validateRequest(assertIsEpisodeGetOneByIdRequest);

export const getAllValidation = validateRequest(assertIsEpisodeGetAllRequest);

export const patchOneByIdValidation = validateRequest(assertIsEpisodePatchOneByIdRequest);

export const getManyBySearchValidation = validateRequest(assertIsEpisodeGetManyBySearchRequest);