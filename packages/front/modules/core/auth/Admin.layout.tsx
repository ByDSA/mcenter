import { Forbidden } from "../errors/403";
import { guardLoggedUser } from "./Logged.layout";
import { isAdmin } from "./utils";

// eslint-disable-next-line import/no-default-export
export default async function AdminLayout( { children } ) {
  const user = await guardLoggedUser();

  if (!isAdmin(user))
    return Forbidden();

  return children;
}
