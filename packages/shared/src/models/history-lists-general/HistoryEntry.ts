/* eslint-disable import/prefer-default-export */
import { z } from "zod";
import { DateTypeSchema } from "../../utils/time";

export function makeEntrySchema<T extends z.ZodTypeAny>(resourceId: T) {
  return z.object( {
    resourceId,
    date: DateTypeSchema,
  } ).strict();
}