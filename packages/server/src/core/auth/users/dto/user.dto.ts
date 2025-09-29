import z from "zod";
import { createZodDto } from "nestjs-zod";

const userDtoSchema = z.object( {
  email: z.string(),

  publicName: z.string(),

  firstName: z.string().optional(),

  lastName: z.string().optional(),

  roles: z.array(z.string()),
} );

export class UserDto extends createZodDto(userDtoSchema) {}
const userSignUpDto = userDtoSchema.omit( {
  roles: true,
} );

export class UserSignUpDto extends createZodDto(userSignUpDto) {}
