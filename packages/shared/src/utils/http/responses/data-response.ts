/* eslint-disable no-redeclare */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import z from "zod";
import { errorElementResponseSchema } from "./error-element";

export type ResultResponse<T = any, W=any> = Omit<z.infer<
ReturnType<typeof createOneResultResponseSchema<any>>
>, "data" | "warnings"> & {
  data: T;
  warnings?: W[];
};

// Se hace overload por el tipo de retorno de warnings
export function createOneResultResponseSchema<T extends z.ZodSchema>(
  schema: T,
): z.ZodObject<{
  data: z.ZodUnion<[T, z.ZodNull]>;
  errors: z.ZodOptional<z.ZodArray<typeof errorElementResponseSchema>>;
  warnings: z.ZodOptional<z.ZodArray<z.ZodAny>>;
}>;

export function createOneResultResponseSchema<T extends z.ZodSchema, W extends z.ZodSchema>(
  schema: T,
  options: { warningsSchema: W },
): z.ZodObject<{
  data: z.ZodUnion<[T, z.ZodNull]>;
  errors: z.ZodOptional<z.ZodArray<typeof errorElementResponseSchema>>;
  warnings: z.ZodOptional<z.ZodArray<W>>;
}>;

export function createOneResultResponseSchema<
T extends z.ZodSchema,
 W extends z.ZodSchema = z.ZodAny,
>(schema: T, options?: { warningsSchema?: W } ) {
  return z.object( {
    data: schema.or(z.null()),
    errors: z.array(errorElementResponseSchema).optional(),
    warnings: z.array(options?.warningsSchema ?? z.any()).optional(),
  } ).strict();
}

export function createManyResultResponseSchema<T extends z.ZodSchema>(
  schema: T,
): z.ZodObject<{
  data: z.ZodArray<T>;
  errors: z.ZodOptional<z.ZodArray<typeof errorElementResponseSchema>>;
  warnings: z.ZodOptional<z.ZodArray<z.ZodAny>>;
}>;

export function createManyResultResponseSchema<T extends z.ZodSchema, W extends z.ZodSchema>(
  schema: T,
  options: { warningsSchema: W },
): z.ZodObject<{
  data: z.ZodArray<T>;
  errors: z.ZodOptional<z.ZodArray<typeof errorElementResponseSchema>>;
  warnings: z.ZodOptional<z.ZodArray<W>>;
}>;

export function createManyResultResponseSchema<
T extends z.ZodSchema,
 W extends z.ZodSchema = z.ZodAny
>(schema: T, options?: { warningsSchema?: W } ) {
  return createOneResultResponseSchema(schema, options as any)
    .omit( {
      data: true,
    } )
    .extend( {
      data: z.array(schema),
    } );
}

export function createPaginatedResultResponseSchema<
  T extends z.ZodSchema,
  U extends z.ZodRawShape = {}
>(schema: T, metadataSchema?: z.ZodObject<U>) {
  const baseMetadata = z.object( {
    totalCount: z.number().optional(),
  } );
  const metadata = metadataSchema
    ? baseMetadata.merge(metadataSchema)
    : baseMetadata;

  return createManyResultResponseSchema(schema).extend( {
    metadata: metadata.optional(),
  } );
}

export type PaginatedResult<T, M = {}> = {
  data: T[];
  metadata?: M & { totalCount?: number };
};

export function createSuccessResultResponse<T>(data: T): ResultResponse<T> {
  return {
    data,
  } satisfies ResultResponse<T>;
}
