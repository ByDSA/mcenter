import z from "zod";
import { replaceSchemaTimestampsToStrings } from "../../../../models/resource/dto";
import { musicHistoryEntrySchema, MusicHistoryEntry } from "../history-entry";
import { musicDto } from "../../dto/domain";
import { musicEntitySchema } from "../../music";

const dtoSchema = musicHistoryEntrySchema
  .omit( {
    resource: true,
  } )
  .extend( {
    resource: replaceSchemaTimestampsToStrings(musicEntitySchema).optional(),
  } );

type Dto = z.infer<typeof dtoSchema>;

function toModel(dto: Dto): MusicHistoryEntry {
  let resource;

  if (dto.resource)
    resource = musicDto.entity.toModel(dto.resource);

  return {
    ...dto,
    resource,
  };
}

function toDto(model: MusicHistoryEntry): Dto {
  let resource;

  if (model.resource)
    resource = musicDto.entity.toDto(model.resource);

  return {
    ...model,
    resource,
  };
}

export const musicHistoryDto = {
  entry: {
    schema: dtoSchema,
    toModel,
    toDto,
  },
};
