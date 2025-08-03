import z from "zod";
import { replaceSchemaTimestampsToStrings } from "../../../../models/resource/dto";
import { musicHistoryEntryEntitySchema, MusicHistoryEntryEntity } from "../history-entry";
import { MusicDtos } from "../../dto/domain";
import { musicEntitySchema } from "../../music";

export namespace MusicHistoryEntryDtos {
  export namespace Entity {
    export const schema = musicHistoryEntryEntitySchema
      .omit( {
        resource: true,
      } )
      .extend( {
        resource: replaceSchemaTimestampsToStrings(musicEntitySchema).optional(),
      } );
    export type Dto = z.infer<typeof schema>;
    export const toEntity = (dto: Dto): MusicHistoryEntryEntity => {
      let resource;

      if (dto.resource)
        resource = MusicDtos.Entity.fromDto(dto.resource);

      return {
        ...dto,
        resource,
      };
    };
    export const toDto = (model: MusicHistoryEntryEntity): Dto=> {
      let resource;

      if (model.resource)
        resource = MusicDtos.Entity.toDto(model.resource);

      return {
        ...model,
        resource,
      };
    };
  }
};
