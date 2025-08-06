import z from "zod";
import { parseZod } from "../../../../utils/validation/zod";
import { MusicFileInfo, MusicFileInfoEntity, musicFileInfoEntitySchema, musicFileInfoSchema } from "../file-info";

type _Model = MusicFileInfo;
type _Entity = MusicFileInfoEntity;
export namespace MusicFileInfoEntityDtos {
  export namespace Model {
    export const schema = musicFileInfoSchema;

    export type Dto = z.infer<typeof schema>;
    export const toModel = (dto: Dto): _Model => {
      return parseZod(schema, dto);
    };
  }
  export namespace Entity {
    export const schema = musicFileInfoEntitySchema;
    export type Dto = z.infer<typeof schema>;
    export const toEntity = (dto: Dto): _Entity => {
      return parseZod(schema, dto);
    };
    export const toDto = (entity: _Entity): Dto => {
      return parseZod(schema, entity);
    };
  }
}
