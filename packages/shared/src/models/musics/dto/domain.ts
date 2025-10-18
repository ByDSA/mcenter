import z from "zod";
import { replaceSchemaTimestampsToStrings } from "../../resources/dto";
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
        addedAt: new Date(dto.addedAt),
        updatedAt: new Date(dto.updatedAt),
        createdAt: new Date(dto.createdAt),
      };
    };
  }
  export namespace Entity {
    export const schema = replaceSchemaTimestampsToStrings(musicEntitySchema);
    export type Dto = z.infer<typeof schema>;
    export const toEntity = (dto: Dto): _Entity => {
      return {
        ...dto,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
        addedAt: new Date(dto.addedAt),
      };
    };
    export const toDto = (entity: _Entity): Dto => {
      return {
        ...entity,
        createdAt: entity.createdAt.toString(),
        updatedAt: entity.updatedAt.toString(),
        addedAt: entity.addedAt.toString(),
      };
    };
  }
}
