import { createZodDto } from "nestjs-zod";
import { AuthCrudDtos } from "$shared/models/auth/dto/transport";

export class SignUpDto extends createZodDto(AuthCrudDtos.LocalSignUp.bodySchema) {}

export class LoginDto extends createZodDto(AuthCrudDtos.LocalLogin.bodySchema) { }

export * from "$shared/models/auth/dto/transport";
