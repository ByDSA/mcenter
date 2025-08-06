import z from "zod";
import { TimestampsDto, timestampsDtoSchema, TimestampsModel, timestampsSchema } from "../utils/schemas/timestamps";

type InputSchemaType<T extends z.ZodRawShape> = z.ZodObject<
  T & {
    timestamps: typeof timestampsSchema;
  }
>;

type OutputSchemaType<T extends z.ZodRawShape> = z.ZodObject<
  Omit<T, "timestamps"> & {
    timestamps: z.ZodObject<{
      createdAt: z.ZodString;
      updatedAt: z.ZodString;
      addedAt: z.ZodString;
    }>;
  }
>;

export function replaceSchemaTimestampsToStrings<T extends z.ZodRawShape>(
  schema: InputSchemaType<T>,
): OutputSchemaType<T> {
  const ret = schema
    .omit( {
      timestamps: true,
    } )
    .extend( {
      timestamps: timestampsDtoSchema,
    } );

  return ret as OutputSchemaType<T>;
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
