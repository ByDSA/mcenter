import Head from "next/head";
import { Fragment, MouseEventHandler } from "react";
import styles from "./History.module.css";

export default function Play() {
  const playStream: (stream: string)=> MouseEventHandler = (stream: string) => (e) => {
    e.preventDefault();
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/play/stream/${stream}`, {
      method: "GET",
    } );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>MCenter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Play
        </h1>

        <h2>Streams</h2>
        {
          ["simpsons", "fguy", "futurama", "rick-morty"].map((stream) => (
            <Fragment key={stream}>
              <a onClick={playStream(stream)}>Play {stream}</a>
              <br/>
              <br/>
            </Fragment>
          ))
        }
      </main>
    </div>
  );
}
