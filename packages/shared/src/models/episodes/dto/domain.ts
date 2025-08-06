import z from "zod";
import { parseZod } from "../../../utils/validation/zod";
import { Episode, EpisodeEntity, episodeEntitySchema, episodeSchema } from "../episode";

export namespace EpisodeDtos {
  export const schemaDto = episodeSchema;
  export type Dto = z.infer<typeof schemaDto>;
  export const toModel = (dto: Dto): Episode => {
    return parseZod(schemaDto, dto);
  };
  export const schemaFullDto = episodeEntitySchema;
  export type FullDto = z.infer<typeof schemaFullDto>;
  export const toEntity = (dto: FullDto): EpisodeEntity =>{
    return parseZod(schemaFullDto, dto);
  };
};
