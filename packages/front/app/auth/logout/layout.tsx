import { redirect } from "next/navigation";
import { getUser } from "#modules/core/auth/server";
import { FullPageContainer } from "../../FullPageContainer";

export default async function LogoutLayout( { children }: {
  children: React.ReactNode;
} ) {
  const user = await getUser();

  if (!user)
    redirect("/");

  return (
    <>
      <FullPageContainer>
        {children}
      </FullPageContainer>
    </>);
}
