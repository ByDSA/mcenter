/* eslint-disable import/prefer-default-export */
import { assertIsStreamGetManyRequest } from "#shared/models/streams";
import { validateRequest } from "#utils/validation/zod-express";

export const getManyValidation = validateRequest(assertIsStreamGetManyRequest);