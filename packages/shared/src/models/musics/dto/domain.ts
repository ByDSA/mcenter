import z from "zod";
import { replaceSchemaTimestampsToStrings, transformDateTimestampsToDto, transformDtoTimestampsToDates } from "../../resource/dto";
import { Music, MusicEntity, musicEntitySchema, musicSchema } from "../music";

const musicDtoSchema = replaceSchemaTimestampsToStrings(musicSchema);

export type MusicDto = z.infer<typeof musicDtoSchema>;

const musicEntityDtoSchema = replaceSchemaTimestampsToStrings(musicEntitySchema);

export type MusicEntityDto = z.infer<typeof musicEntityDtoSchema>;

function toVo(dto: MusicDto): Music {
  return {
    ...dto,
    timestamps: transformDtoTimestampsToDates(dto.timestamps),
  };
}

function toEntity(dto: MusicEntityDto): MusicEntity {
  return {
    ...dto,
    timestamps: transformDtoTimestampsToDates(dto.timestamps),
  };
}

function entityToDto(entity: MusicEntity): MusicEntityDto {
  return {
    ...entity,
    timestamps: transformDateTimestampsToDto(entity.timestamps),
  };
}

export const musicDto = {
  vo: {
    schema: musicDtoSchema,
    toModel: toVo,
  },
  entity: {
    schema: musicEntityDtoSchema,
    toModel: toEntity,
    toDto: entityToDto,
  },
};
