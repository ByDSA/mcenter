import z from "zod";
import { replaceSchemaTimestampsToStrings, transformDtoTimestampsToDates } from "../../resource/dto";
import { Episode, episodeEntitySchema, episodeSchema } from "../episode";

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
    export const toModel = (dto: Dto): Episode =>{
      return {
        ...dto,
        timestamps: transformDtoTimestampsToDates(dto.timestamps),
      };
    };
  }
};
