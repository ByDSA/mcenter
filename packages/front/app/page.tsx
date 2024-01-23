import "../styles/globals.css";
import styles from "./style.module.css";

export default function Home() {
  const version = process.env.version ?? "undefined";

  return (
    <div className={`extra-margin ${styles.container}`}>
      <main>
        <h1 className={styles.title}>
          <span className={styles.titlePart1}>Welcome to</span><br/><a href="https://mcenter.danisales.es">MCenter</a><span className={styles.titlePart2}>!!!</span>
        </h1>
        <h2 className={styles.version}>Versión: {version}</h2>
      </main>

    </div>
  );
}
