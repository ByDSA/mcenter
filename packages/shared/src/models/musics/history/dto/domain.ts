import z from "zod";
import { replaceSchemaTimestampsToStrings } from "../../../../models/resource/dto";
import { musicHistoryEntryEntitySchema, MusicHistoryEntryEntity } from "../history-entry";
import { MusicDtos } from "../../dto/domain";
import { musicEntitySchema } from "../../music";

export namespace MusicHistoryEntryDtos {
  export namespace Entity {
    export const schema = musicHistoryEntryEntitySchema
      .omit( {
        music: true,
      } )
      .extend( {
        music: replaceSchemaTimestampsToStrings(musicEntitySchema).optional(),
      } );
  export type Dto = z.infer<typeof schema>;
    export const toEntity = (dto: Dto): MusicHistoryEntryEntity => {
      let music;

      if (dto.music)
        music = MusicDtos.Entity.fromDto(dto.music);

      return {
        ...dto,
        music: music,
      };
    };
    export const toDto = (model: MusicHistoryEntryEntity): Dto=> {
      let music;

      if (model.music)
        music = MusicDtos.Entity.toDto(model.music);

      return {
        ...model,
        music,
      };
    };
  }
};
