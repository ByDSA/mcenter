import z from "zod";
import { createZodDto } from "nestjs-zod";
import { globalSignUpDtoSchema } from "../../SignUp";

const schema = globalSignUpDtoSchema.extend( {
  username: z.string().min(1),
  password: z.string().min(1),
} );

export class SignUpDto extends createZodDto(schema) {}
