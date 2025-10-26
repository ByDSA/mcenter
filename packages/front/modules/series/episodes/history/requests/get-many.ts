import { createManyResultResponseSchema } from "$shared/utils/http/responses";
import z from "zod";
import { episodeEntitySchema } from "$shared/models/episodes";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";
import { episodeHistoryEntryEntitySchema } from "../models";

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

export const resSchema = createManyResultResponseSchema(dataSchema);

export type Res = z.infer<typeof resSchema>;

export type Req = EpisodeHistoryEntryCrudDtos.GetManyByCriteria.Criteria;

export const method = "POST";

export type FetchProps = {
  limit?: number;
  offset?: number;
};
