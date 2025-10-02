import NotLoggedLayout from "#modules/core/auth/NotLogged.layout";
import { FullPageContainer } from "../../FullPageContainer";

export default async function LoginLayout( { children }: {
  children: React.ReactNode;
} ) {
  return (
    <>
      {await NotLoggedLayout( {
        children: (
          <FullPageContainer>
            {children}
          </FullPageContainer>
        ),
      } )}
    </>
  );
}
