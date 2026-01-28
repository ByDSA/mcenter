import z from "zod";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { episodeHistoryEntryEntitySchema } from "../models";

export const responseSchema = createOneResultResponseSchema(episodeHistoryEntryEntitySchema);

export type Response = z.infer<typeof responseSchema>;

export const method = "DELETE";
