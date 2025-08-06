import z from "zod";
import { replaceSchemaTimestampsToStrings, transformDtoTimestampsToDates } from "../../resources/dto";
import { Episode, EpisodeEntity, episodeEntitySchema, episodeSchema } from "../episode";

export namespace EpisodeDtos {
  export namespace Model {
    export const schemaDto = replaceSchemaTimestampsToStrings(episodeSchema);
    export type Dto = z.infer<typeof schemaDto>;
    export const toModel = (dto: Dto): Episode => {
      return {
        ...dto,
        timestamps: transformDtoTimestampsToDates(dto.timestamps),
      };
    };
  }
  export namespace Entity {
    export const schemaDto = replaceSchemaTimestampsToStrings(episodeEntitySchema);
    export type Dto = z.infer<typeof schemaDto>;
    export const toEntity = (dto: Dto): EpisodeEntity =>{
      return {
        ...dto,
        timestamps: transformDtoTimestampsToDates(dto.timestamps),
      };
    };
  }
};
