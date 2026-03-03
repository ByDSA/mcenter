import { i18nServerContext } from "#modules/core/i18n/server-locale";
import "../styles/globals.css";
import { FullPageContainer } from "./FullPageContainer";
import styles from "./style.module.css";

export default async function Home() {
  const version = process.env.version ?? "undefined";
  const buildDate = process.env.BUILD_DATE ?? "No disponible";
  const { LL } = await i18nServerContext();

  return (
    <FullPageContainer>
      <h1 className={styles.title}>
        {LL.main.welcome()}
      </h1>
      <span className={styles.stamp}>
        v{version} {buildDate}
      </span>
    </FullPageContainer>
  );
}
