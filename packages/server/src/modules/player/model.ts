import { createZodDto } from "nestjs-zod";
import z from "zod";

export const secretTokenBodySchema = z.object( {
  secretToken: z.string(),
} );

export class SecretTokenBodyDto extends createZodDto(secretTokenBodySchema) {}

export type SecretTokenBody = z.infer<typeof secretTokenBodySchema>;
