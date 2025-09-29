import NotLoggedLayout from "#modules/core/auth/NotLogged.layout";
import { FullPageContainer } from "../../FullPageContainer";

export default function LoginLayout( { children }: {
  children: React.ReactNode;
} ) {
  return (
    <>
      <NotLoggedLayout>
        <FullPageContainer>
          {children}
        </FullPageContainer>
      </NotLoggedLayout>
    </>);
}
