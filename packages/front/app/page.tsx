import "../styles/globals.css";
import styles from "./style.module.css";

export default function Home() {
  const version = process.env.version ?? "undefined";
  const buildDate = process.env.BUILD_DATE ?? "No disponible";

  return (
    <div className={`extra-margin ${styles.container}`}>
      <main>
        <h1 className={styles.title}>
          <span className={styles.titlePart1}>Welcome to</span><br/><a href="https://mcenter.danisales.es">MCenter</a><span className={styles.titlePart2}>!!!</span>
        </h1>
        <span className={styles.stamp}>
          <h2 className={styles.version}>Versión: {version}</h2>
          <h3 className={styles.date}>{buildDate}</h3>
        </span>
      </main>

    </div>
  );
}
