import z from "zod";
import { replaceSchemaTimestampsToStrings, transformDateTimestampsToDto, transformDtoTimestampsToDates } from "../../resource/dto";
import { Music, MusicEntity, musicEntitySchema, musicSchema } from "../music";

type _Model = Music;
type _Entity = MusicEntity;
export namespace MusicDtos {
  export namespace Model {
export const schema = replaceSchemaTimestampsToStrings(musicSchema);

export type Dto = z.infer<typeof schema>;
export const toModel = (dto: Dto): _Model => {
  return {
    ...dto,
    timestamps: transformDtoTimestampsToDates(dto.timestamps),
  };
};
  }
  export namespace Entity {
  export const schema = replaceSchemaTimestampsToStrings(musicEntitySchema);
  export type Dto = z.infer<typeof schema>;
  export const fromDto = (dto: Dto): _Entity => {
    return {
      ...dto,
      timestamps: transformDtoTimestampsToDates(dto.timestamps),
    };
  };
export const toDto = (entity: _Entity): Dto => {
  return {
    ...entity,
    timestamps: transformDateTimestampsToDto(entity.timestamps),
  };
};
  }
}
