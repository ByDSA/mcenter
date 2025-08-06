import z from "zod";
import { EpisodeFileInfo, EpisodeFileInfoEntity, episodeFileInfoEntitySchema, episodeFileInfoSchema } from "../../file-info";
import { parseZod } from "../../../../../utils/validation/zod";

export namespace EpisodeFileInfoDtos {
  export const schemaDto = episodeFileInfoSchema;
  export type Dto = z.infer<typeof schemaDto>;
  export const schemaFullDto = episodeFileInfoEntitySchema;
  export type FullDto = z.infer<typeof schemaFullDto>;
  export const toModel = (dto: Dto): EpisodeFileInfo => {
    return parseZod(schemaDto, dto);
  };
  export const toEntity = (dto: FullDto): EpisodeFileInfoEntity => {
    return parseZod(schemaFullDto, dto);
  };
};
