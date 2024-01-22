import "../styles/globals.css";
import styles from "./style.module.css";

export default function Home() {
  const version = process.env.version ?? "undefined";

  return (
    <div className={`extra-margin ${styles.container}`}>
      <main>
        <h1 className={styles.title}>
          Welcome to<br/><a href="https://mcenter.danisales.es">MCenter</a>!
        </h1>
        <h2 className={styles.version}>Versión: {version}</h2>
      </main>

    </div>
  );
}
