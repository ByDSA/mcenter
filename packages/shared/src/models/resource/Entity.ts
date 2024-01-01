import { z } from "zod";
import { ValueObjectSchema } from "./ValueObject";

export type Entity<ID> = z.infer<typeof ValueObjectSchema> & {
  id: ID;
};