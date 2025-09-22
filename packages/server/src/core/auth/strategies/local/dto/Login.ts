import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { userEntityWithRolesSchema } from "#core/auth/users/dto/user.dto";

const schema = z.object( {
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
} );

export class LoginDto extends createZodDto(schema) { }

const responseSchema = createOneResultResponseSchema(userEntityWithRolesSchema);

export {
  schema as loginBodySchema,
  responseSchema as loginResponseSchema,
  responseSchema as signUpResponseSchema,
};
