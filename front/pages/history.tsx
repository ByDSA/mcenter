import Head from "next/head";
import HistoryList from "../modules/history/HistoryList";
import styles from "./History.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>MCenter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Historial
        </h1>

        <HistoryList />
      </main>
    </div>
  );
}
