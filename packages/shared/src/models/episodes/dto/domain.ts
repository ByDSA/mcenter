import z from "zod";
import { replaceSchemaTimestampsToStrings, transformDtoTimestampsToDates } from "../../resource/dto";
import { Episode, episodeEntitySchema, episodeSchema } from "../episode";

const dtoSchema = replaceSchemaTimestampsToStrings(episodeSchema);

type Dto = z.infer<typeof dtoSchema>;

function dtoToModel(dto: Dto): Episode {
  return {
    ...dto,
    timestamps: transformDtoTimestampsToDates(dto.timestamps),
  };
}
const entityDtoSchema = replaceSchemaTimestampsToStrings(episodeEntitySchema);

type EntityDto = z.infer<typeof entityDtoSchema>;

function entityDtoToModel(dto: Dto): Episode {
  return {
    ...dto,
    timestamps: transformDtoTimestampsToDates(dto.timestamps),
  };
}

export const serieDto = {
  vo: {
    schema: dtoSchema,
    toModel: dtoToModel,
  },
  entity: {
    schema: entityDtoSchema,
    toModel: entityDtoToModel,
  },
};

export {
  Dto as EpisodeDto,
  EntityDto as EpisodeEntityDto,
};
