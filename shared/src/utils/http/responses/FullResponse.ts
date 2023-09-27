import { z } from "zod";
import { LogElementResponseSchema } from "./LogElement";

const Schema = z.object( {
  errors: z.array(LogElementResponseSchema).optional(),
  warnings: z.array(LogElementResponseSchema).optional(),
  data: z.any().optional(),
} ).strict();

export function createFullResponseSchemaWithData<T>(dataSchema: z.ZodSchema<T>) {
  return Schema.extend( {
    data: dataSchema,
  } );
}

type Model<T = any> = z.infer<typeof Schema> & {
  data?: T;
};

export default Model;

export function assertIsModel<T>(o: unknown): asserts o is Model<T> {
  Schema.parse(o);
}