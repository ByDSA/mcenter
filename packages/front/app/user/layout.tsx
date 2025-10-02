import LoggedLayout from "#modules/core/auth/Logged.layout";
import { PageContainer } from "app/PageContainer";

export default async function UserPageLayout( { children }: {
  children: React.ReactNode;
} ) {
  const loggedLayout = await LoggedLayout( {
    children: (
      <PageContainer>
        {children}
      </PageContainer>
    ),
  } );

  return loggedLayout;
}
