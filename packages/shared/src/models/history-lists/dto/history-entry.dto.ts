import { z } from "zod";
import { historyEntrySchema } from "../history-entry";

export const historyEntryDtoSchema = historyEntrySchema;

export type HistoryEntryDto = z.infer<typeof historyEntryDtoSchema>;
