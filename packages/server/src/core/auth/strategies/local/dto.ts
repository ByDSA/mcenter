import { createZodDto } from "nestjs-zod";
import { localSignUpBodySchema, localLoginBodySchema } from "$shared/models/auth/local/dto";

export class SignUpDto extends createZodDto(localSignUpBodySchema) {}

export class LoginDto extends createZodDto(localLoginBodySchema) { }

export * from "$shared/models/auth/local/dto";
