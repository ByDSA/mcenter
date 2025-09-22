import z from "zod";

export const globalSignUpDtoSchema = z.object( {
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
} );
