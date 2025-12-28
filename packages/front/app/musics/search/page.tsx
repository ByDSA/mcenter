"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MusicList } from "#modules/musics/musics/MusicList";
import MusicLayout from "../music.layout";
import styles from "./page.module.css";

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [filters, setFilters] = useState<Parameters<typeof MusicList>[0]["filters"]>( {} );
  const onPressEnter = useCallback(() => {
    setFilters(old => ( {
      ...old,
      title: query,
    } ));
  }, [query]);

  useEffect(() => {
    onPressEnter();
  }, [query]);

  return (
    <MusicLayout>
      <header className={styles.marginTop}></header>
      <MusicList
        filters={filters}
      />
    </MusicLayout>
  );
}
