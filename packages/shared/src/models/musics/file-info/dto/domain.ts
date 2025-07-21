import z from "zod";
import { MusicFileInfo, MusicFileInfoEntity, musicFileInfoEntitySchema, musicFileInfoSchema } from "../file-info";
import { replaceSchemaTimestampsFileToStrings, transformDateTimestampsFileToDto, transformDtoTimestampsFileToDates } from "../../../file-info-common/dto";

type _Model = MusicFileInfo;
type _Entity = MusicFileInfoEntity;
export namespace MusicFileInfoEntityDtos {
  export namespace Model {
export const schema = replaceSchemaTimestampsFileToStrings(musicFileInfoSchema);

export type Dto = z.infer<typeof schema>;
export const toModel = (dto: Dto): _Model => {
  return {
    ...dto,
    timestamps: transformDtoTimestampsFileToDates(dto.timestamps),
  };
};
  }
  export namespace Entity {
  export const schema = replaceSchemaTimestampsFileToStrings(musicFileInfoEntitySchema);
  export type Dto = z.infer<typeof schema>;
  export const fromDto = (dto: Dto): _Entity => {
    return {
      ...dto,
      timestamps: transformDtoTimestampsFileToDates(dto.timestamps),
    };
  };
export const toDto = (entity: _Entity): Dto => {
  return {
    ...entity,
    timestamps: transformDateTimestampsFileToDto(entity.timestamps),
  };
};
  }
}
