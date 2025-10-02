import z from "zod";
import { createOneResultResponseSchema } from "../../../utils/http/responses";
import { userEntityWithRolesSchema } from "..";

const schema = z.object( {
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(1),
} );

type LocalSignUpBody = z.infer<typeof schema>;

const responseSchema = createOneResultResponseSchema(userEntityWithRolesSchema);

type Response = z.infer<typeof responseSchema>;

export {
  schema as localSignUpBodySchema,
  LocalSignUpBody,
  responseSchema as oauthSignUpResponseSchema,
  Response as OauthSignUpResponse,
};
