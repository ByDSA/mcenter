import { z } from "zod";
import { valueObjectSchema } from "./ValueObject";

export type Entity<ID> = z.infer<typeof valueObjectSchema> & {
  id: ID;
};
