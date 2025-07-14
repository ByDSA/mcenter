import { z } from "zod";
import { HistoryListEntity, historyListEntitySchema } from "../history-list";
import { historyEntrySchema } from "../history-entry";

export const historyListDtoSchema = historyListEntitySchema.omit( {
  entries: true,
} ).extend( {
  entries: z.array(historyEntrySchema),
} );

export type HistoryListDto = z.infer<typeof historyListDtoSchema>;

export function dtoToHistoryList(dto: HistoryListDto): HistoryListEntity {
  return {
    id: dto.id,
    entries: dto.entries,
    maxSize: dto.maxSize,
  };
}
