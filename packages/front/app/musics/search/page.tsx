"use client";

import { useSearchParams } from "next/navigation";
import { SearchMusicList } from "#modules/musics/musics/SearchMusicList";
import MusicLayout from "../music.layout";
import styles from "./page.module.css";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <MusicLayout>
      <header className={styles.marginTop}></header>
      <SearchMusicList
        filters={{
          title: query,
        }}
      />
    </MusicLayout>
  );
}
