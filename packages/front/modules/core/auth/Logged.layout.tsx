import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PATH_ROUTES } from "$shared/routing";
import { Forbidden } from "../errors/403";
import { getUser } from "./server";
import { isUser } from "./utils";

// eslint-disable-next-line import/no-default-export
export default async function LoggedLayout( { children } ) {
  const user = await guardLoggedUser();

  if (!isUser(user))
    return Forbidden();

  return children;
}

export async function guardLoggedUser() {
  const user = await getUser();

  if (!user) {
    const headersList = await headers();
    const referer = headersList.get("x-url");
    const currentUrl = referer ?? "/";

    redirect(PATH_ROUTES.auth.frontend.login.withParams( {
      redirect: currentUrl,
    } ));
  }

  return user;
}
