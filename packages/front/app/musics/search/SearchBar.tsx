"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SearchBarView } from "#modules/ui-kit/SearchBar";
import { useMusicSearch } from "#modules/musics/MusicSearchContext";
import styles from "./SearchBar.module.css";

export function SearchBar() {
  const searchParams = useSearchParams();
  const { filters, setQueryFilter } = useMusicSearch();

  useEffect(()=> {
    const query = searchParams.get("q");

    if (query)
      setQueryFilter(query);
  }, []);
  const router = useRouter();
  const search = (value: string) => {
    const cleanTxt = value.trim();

    if (cleanTxt)
      router.push(`${PATH_ROUTES.musics.frontend.search.path}?q=${encodeURIComponent(cleanTxt)}`);
  };

  return <section className={styles.searchRow}>
    <SearchBarView
      action={search}
      value={filters.query}
      onChange={(e) => setQueryFilter(e.target.value)}
      placeholder="Buscar música..."
    />
  </section>;
}
