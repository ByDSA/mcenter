import z from "zod";
import { mongoDbId } from "../resources/partial-schemas";
import { dateSchema } from "../utils/schemas/timestamps/date";
import { userEntitySchema, UserEntityWithRoles } from "./user";

const counterSchema = z.number().int()
  .positive();
const schema = z.object( {
  userId: mongoDbId,
  username: z.string(),
  passwordHash: z.string(),
  createdAt: dateSchema,

  // Verificación
  verificationToken: z.string().optional(), // Si es undefined, está verificada
  verificationTokenExpiresAt: dateSchema.optional(),
  lastVerificationEmailSentAt: dateSchema.optional(),
  verificationEmailCount: counterSchema.optional(),

  // Reset password rate limiting
  lastResetEmailSentAt: dateSchema.optional(),
  resetEmailCount: counterSchema.optional(),

  // Login rate limiting (separado)
  failedLoginAttempts: counterSchema.optional(),
  lastFailedLoginAt: dateSchema.optional(),
  lockedUntil: dateSchema.optional(),
} );

export type UserPass = z.infer<typeof schema>;

const userPassEntitySchema = schema.extend( {
  id: mongoDbId,
  user: userEntitySchema.optional(),
} );

export type UserPassEntity = z.infer<typeof userPassEntitySchema>;

export type UserPassEntityWithUserWithRoles = UserPassEntity & {
  user: UserEntityWithRoles;
};

export {
  schema as userPassSchema,
  userPassEntitySchema as entitySchema,
};
