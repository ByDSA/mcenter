import z from "zod";
import { timestampsDtoSchema, TimestampsFileDto, TimestampsFileModel, timestampsFileSchema } from "../utils/schemas/timestamps";

type InputSchemaType<T extends z.ZodRawShape> = z.ZodObject<
  T & {
    timestamps: typeof timestampsFileSchema;
  }
>;

type OutputSchemaType<T extends z.ZodRawShape> = z.ZodObject<
  Omit<T, "timestamps"> & {
    timestamps: z.ZodObject<{
      createdAt: z.ZodString;
      updatedAt: z.ZodString;
    }>;
  }
>;

export function replaceSchemaTimestampsFileToStrings<T extends z.ZodRawShape>(
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

export function transformDtoTimestampsFileToDates(
  timestamps: TimestampsFileDto,
): TimestampsFileModel {
  return {
    createdAt: new Date(timestamps.createdAt),
    updatedAt: new Date(timestamps.updatedAt),
  };
}

export function transformDateTimestampsFileToDto(
  timestamps: TimestampsFileModel,
): TimestampsFileDto {
  return {
    createdAt: timestamps.createdAt.toISOString(),
    updatedAt: timestamps.updatedAt.toISOString(),
  };
}
