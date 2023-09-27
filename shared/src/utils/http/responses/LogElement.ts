import { z } from "zod";

const Schema = z.object( {
  message: z.string(),
  type: z.string(),
  data: z.any().optional(),
} ).strict();

type Model = z.infer<typeof Schema>;

export default Model;

export {
  Schema as LogElementResponseSchema,
};

export function assertIsModel(o: unknown): asserts o is Model {
  Schema.parse(o);
}