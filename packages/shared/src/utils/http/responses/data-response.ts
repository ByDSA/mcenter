import z from "zod";
import { assertZodPopStack } from "../../validation/zod";
import { errorElementResponseSchema } from "./error-element";

export type ResultResponse<T = any> = Omit<z.infer<
ReturnType<typeof createOneResultResponseSchema<any>>
>, "data"> & {
  data: T;
};

export function createOneResultResponseSchema<T extends z.ZodSchema>(schema: T) {
  return z.object( {
    data: schema.or(z.null()),
    errors: z.array(errorElementResponseSchema).optional(),
    warnings: z.array(z.any()).optional(),
  } ).strict();
}

export function createManyResultResponseSchema<T extends z.ZodSchema>(schema: T) {
  return createOneResultResponseSchema(schema)
    .omit( {
      data: true,
    } )
    .extend( {
      data: z.array(schema),
    } );
}

export function createPaginatedResultResponseSchema<T extends z.ZodSchema>(schema: T) {
  return createManyResultResponseSchema(schema)
    .extend( {
      metadata: z.object( {
        totalCount: z.number().optional(),
      } ).optional(),
    } );
}

export type PaginatedResult<T = any> = Omit<z.infer<
ReturnType<typeof createPaginatedResultResponseSchema<any>>
>, "data"> & {
  data: T[];
};

export function assertIsOneResultResponse<T>(
  res: unknown,
  dataSchema: z.ZodSchema<T>,
): asserts res is ResultResponse<T> {
  const modelSchema = createOneResultResponseSchema(dataSchema);

  assertZodPopStack(modelSchema, res);
}

export function genAssertIsOneResultResponse<T, R>(dataSchema: z.ZodSchema<T>) {
  return (res: R) => assertIsOneResultResponse(res, dataSchema);
}

export function assertIsManyResultResponse<T>(
  res: unknown,
  dataSchema: z.ZodSchema<T>,
): asserts res is ResultResponse<T[]> {
  const modelSchema = createManyResultResponseSchema(dataSchema);

  assertZodPopStack(modelSchema, res);
}

export function genAssertIsManyResultResponse<T, R>(dataSchema: z.ZodSchema<T>) {
  return (res: R) => assertIsManyResultResponse(res, dataSchema);
}

export function createSuccessResultResponse<T>(data: T): ResultResponse<T> {
  return {
    data,
  } satisfies ResultResponse<T>;
}
