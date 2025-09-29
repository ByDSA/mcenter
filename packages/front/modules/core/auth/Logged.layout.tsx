import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PATH_ROUTES } from "$shared/routing";
import { Forbidden } from "../errors/403";
import { UserRoleName } from "./models";
import { getUser } from "./server";

// eslint-disable-next-line import/no-default-export
export default async function LoggedLayout( { children } ) {
  const user = await getUser();

  if (!user) {
    const headersList = await headers();
    const referer = headersList.get("x-url");
    const currentUrl = referer ?? "/";

    redirect(PATH_ROUTES.auth.frontend.login.withParams( {
      redirect: currentUrl,
    } ));
  }

  if (!user.roles.find(r=>r.name === UserRoleName.USER))
    return Forbidden();

  return children;
}
