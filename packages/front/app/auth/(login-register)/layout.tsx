import NotLoggedLayout from "#modules/core/auth/NotLogged.layout";
import { PageContainer } from "app/PageContainer";
import styles from "./styles.module.css";

export default async function LoginLayout( { children }: {
  children: React.ReactNode;
} ) {
  return (
    <>
      {await NotLoggedLayout( {
        children: (
          <PageContainer className={styles.container}>
            {children}
          </PageContainer>
        ),
      } )}
    </>
  );
}
