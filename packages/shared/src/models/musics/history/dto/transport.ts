import z from "zod";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { mongoDbId } from "../../../resources/partial-schemas";
import { musicHistoryEntryEntitySchema } from "../history-entry";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";

export namespace MusicHistoryEntryCrudDtos {
  const responseOneSchema = createOneResultResponseSchema(musicHistoryEntryEntitySchema);
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        resourceId: z.string().optional(),
        timestampMax: z.number().optional(),
        userId: mongoDbId.optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: ["musics", "musicsFileInfos", "musicsFavorite", "musicsImageCover"],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const bodySchema = criteriaSchema.default( {} );

    export const dataSchema = musicHistoryEntryEntitySchema;

    export type Data = z.infer<typeof dataSchema>;

    export const responseSchema = createManyResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace Delete {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace GetOneById {
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
  export namespace CreateOne {
    export const bodySchema = z.object( {
      musicId: mongoDbId,
      timestamp: z.number().optional(),
    } );
    export type Body = z.infer<typeof bodySchema>;
    export const responseSchema = responseOneSchema;
    export type Response = z.infer<typeof responseSchema>;
  }
};
