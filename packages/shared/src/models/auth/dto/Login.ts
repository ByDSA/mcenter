import z from "zod";
import { createOneResultResponseSchema } from "../../../utils/http/responses";
import { userEntityWithRolesSchema } from "..";

const schema = z.object( {
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
} );
const responseSchema = createOneResultResponseSchema(userEntityWithRolesSchema);

type LocalLoginBody = z.infer<typeof schema>;
type LocalLoginResponse = z.infer<typeof responseSchema>;

export {
  LocalLoginBody,
  LocalLoginResponse,
  schema as localLoginBodySchema,
  responseSchema as localLoginResponseSchema,
};
