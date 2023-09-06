import { MongoSchema } from "#main/db/migrations/utils";
import { assertZodPopStack } from "#shared/utils/validation/zod";
import { z } from "zod";
import { HistoryEntryInStreamSchema, OldDateTypeSchema } from "../models/HistoryEntryInStream";
import { StreamWithHistoryListSchema } from "../models/StreamWithHistoryList";

const OldDateTypeSchemaDocOdm = OldDateTypeSchema.merge(MongoSchema);
const HistoryEntryInStreamSchemaDocOdm = HistoryEntryInStreamSchema.merge(MongoSchema).extend( {
  date: OldDateTypeSchemaDocOdm,
} );
const StreamWithHistoryListDocOdmSchema = MongoSchema.merge(StreamWithHistoryListSchema).extend( {
  history: z.array(HistoryEntryInStreamSchemaDocOdm),
} );

/**
 * @deprecated
 */
export type DocOdm = z.infer<typeof StreamWithHistoryListDocOdmSchema>;

export function assertIsStreamWithHistoryListDocOdm(model: unknown): asserts model is DocOdm {
  assertZodPopStack(StreamWithHistoryListDocOdmSchema, model);
}