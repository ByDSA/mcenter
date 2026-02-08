import z from "zod";
import { mongoDbId } from "../../../resources/partial-schemas";
import { createCriteriaManySchema } from "../../../utils/schemas/requests/criteria";
import { createManyResultResponseSchema, createOneResultResponseSchema } from "../../../../utils/http/responses";
import { episodeHistoryEntryEntitySchema, episodeHistoryEntrySchema } from "../history-entry";
import { episodeEntitySchema } from "../../episode";

export namespace EpisodeHistoryEntryCrudDtos {
  export namespace GetMany {
    export const criteriaSchema = createCriteriaManySchema( {
      filterShape: {
        seriesId: z.string().optional(),
        episodeId: z.string().optional(),
        episodeKey: z.string().optional(),
        timestampMax: z.number().optional(),
        userId: mongoDbId.optional(),
      },
      sortKeys: ["timestamp"],
      expandKeys: [
        "episodesSeries",
        "episodes",
        "episodesFileInfos",
        "episodesUserInfo",
        "episodesSeriesImageCover",
      ],
    } );
    export type Criteria = z.infer<typeof criteriaSchema>;
    export const dataSchema = episodeHistoryEntryEntitySchema
      .omit( {
        resource: true,
      } )
      .extend( {
        resource: episodeEntitySchema.required( {
          fileInfos: true,
          userInfo: true,
        } ),
      } );

    export type Data = z.infer<typeof dataSchema>;
    export const responseSchema = createManyResultResponseSchema(dataSchema);
    export type Response = z.infer<typeof responseSchema>;
  }

  export namespace CreateOne {
    // Necesaria 'date' para crear con efecto retroactivo
    export const bodySchema = episodeHistoryEntrySchema
      .omit( {
        userId: true,
      } );

    export type Body = z.infer<typeof bodySchema>;
  }

  export namespace DeleteOne {
    export const responseSchema = createOneResultResponseSchema(episodeHistoryEntryEntitySchema);

    export type Response = z.infer<typeof responseSchema>;
  }
};
