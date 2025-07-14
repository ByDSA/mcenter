import z from "zod";
import { EpisodeHistoryListEntity, episodeHistoryListEntitySchema } from "../../history-list";
import { episodeHistoryEntrySchema } from "../../history-entry";

const schema = episodeHistoryListEntitySchema.omit( {
  entries: true,
} ).extend( {
  entries: z.array(episodeHistoryEntrySchema),
} );

type Dto = z.infer<typeof schema>;

function dtoToModel(dto: Dto): EpisodeHistoryListEntity {
  return {
    id: dto.id,
    entries: dto.entries,
    maxSize: dto.maxSize,
  };
}

export {
  schema as episodeHistoryListDtoSchema,
  Dto as EpisodeHistoryListDto,
  dtoToModel as dtoToEpisodeHistoryList,
};
