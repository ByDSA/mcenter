"use client";

import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className="extra-margin" style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "calc(100vh - 78px)",
    }}>
      <main>
        <h1 className={styles.title}>
          Welcome to <a href="https://mcenter.danisales.es">MCenter!</a>
        </h1>
      </main>

    </div>
  );
}
