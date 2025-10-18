import z from "zod";
import { TimestampsDto, TimestampsModel } from "../utils/schemas/timestamps";

export function replaceSchemaTimestampsToStrings<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) {
  const ret = schema
    .omit( {
      createdAt: true,
      updatedAt: true,
      addedAt: true,
    }as any)
    .extend( {
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      addedAt: z.string().datetime(),
    } );

  return ret as z.ZodObject<Omit<T, "addedAt" | "createdAt" | "updatedAt"> & {
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    addedAt: z.ZodString;
  }>;
}

export function transformDtoTimestampsToDates(timestamps: TimestampsDto): TimestampsModel {
  return {
    createdAt: new Date(timestamps.createdAt),
    updatedAt: new Date(timestamps.updatedAt),
    addedAt: new Date(timestamps.addedAt),
  };
}

export function transformDateTimestampsToDto(timestamps: TimestampsModel): TimestampsDto {
  return {
    createdAt: timestamps.createdAt.toISOString(),
    updatedAt: timestamps.updatedAt.toISOString(),
    addedAt: timestamps.addedAt.toISOString(),
  };
}
