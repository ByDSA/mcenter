import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUser } from "./server";

// eslint-disable-next-line import/no-default-export
export default async function NotLoggedLayout( { children } ) {
  const user = await getUser();

  if (user) {
    const headersList = await headers();
    const searchParamsPlain = headersList.get("x-search");
    const searchParams = new URLSearchParams(searchParamsPlain ?? "");
    const redirectUrl = searchParams.get("redirect") ?? "/";

    redirect(redirectUrl);
  }

  return children;
}
