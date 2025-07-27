import z from "zod";
import { assertZodPopStack } from "../../validation/zod";
import { errorElementResponseSchema } from "./error-element";

// TODO: renombrar todo a "ResultResponse" o similar,
export type DataResponse<T = any> = Omit<z.infer<
ReturnType<typeof createOneDataResponseSchema<any>>
>, "data"> & {
  data: T;
};

export function createOneDataResponseSchema<T extends z.ZodSchema>(schema: T) {
  return z.object( {
    data: schema.or(z.null()),
    errors: z.array(errorElementResponseSchema).optional(),
    warnings: z.array(z.any()).optional(),
  } ).strict();
}

export function createManyDataResponseSchema<T extends z.ZodSchema>(schema: T) {
  return createOneDataResponseSchema(schema)
    .omit( {
      data: true,
    } )
    .extend( {
      data: z.array(schema),
    } );
}

export function assertIsOneDataResponse<T>(
  res: unknown,
  dataSchema: z.ZodSchema<T>,
): asserts res is DataResponse<T> {
  const modelSchema = createOneDataResponseSchema(dataSchema);

  assertZodPopStack(modelSchema, res);
}

export function genAssertIsOneDataResponse<T, R>(dataSchema: z.ZodSchema<T>) {
  return (res: R) => assertIsOneDataResponse(res, dataSchema);
}

export function assertIsManyDataResponse<T>(
  res: unknown,
  dataSchema: z.ZodSchema<T>,
): asserts res is DataResponse<T[]> {
  const modelSchema = createManyDataResponseSchema(dataSchema);

  assertZodPopStack(modelSchema, res);
}

export function genAssertIsManyDataResponse<T, R>(dataSchema: z.ZodSchema<T>) {
  return (res: R) => assertIsManyDataResponse(res, dataSchema);
}

export function createSuccessDataResponse<T>(data: T): DataResponse<T> {
  return {
    data,
  } satisfies DataResponse<T>;
}
