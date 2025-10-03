import "../styles/globals.css";
import { FullPageContainer } from "./FullPageContainer";
import styles from "./style.module.css";

export default function Home() {
  const version = process.env.version ?? "undefined";
  const buildDate = process.env.BUILD_DATE ?? "No disponible";

  return (
    <FullPageContainer>
      <h1 className={styles.title}>
        Welcome to MCenter
      </h1>
      <span className={styles.stamp}>
        v{version} {buildDate}
      </span>
    </FullPageContainer>
  );
}
