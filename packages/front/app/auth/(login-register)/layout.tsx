import NotLoggedLayout from "#modules/core/auth/NotLogged.layout";
import { PageContainer } from "#modules/ui-kit/layouts/PageContainer/PageContainer";
import { PageContent } from "#modules/ui-kit/layouts/PageContainer/PageContent";
import styles from "./styles.module.css";

export default async function LoginLayout( { children }: {
  children: React.ReactNode;
} ) {
  return (
    <>
      {await NotLoggedLayout( {
        children: (
          <PageContainer className={styles.container}>
            <PageContent>
              {children}
            </PageContent>
          </PageContainer>
        ),
      } )}
    </>
  );
}
