"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./SearchBar.module.css";
import { SearchBarView } from "#modules/ui-kit/SearchBar";

export function SearchBar() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [txt, setTxt] = useState(query);
  const router = useRouter();
  const search = (value: string) => {
    const cleanTxt = value.trim();

    if (cleanTxt)
      router.push(`${PATH_ROUTES.musics.frontend.search.path}?q=${encodeURIComponent(cleanTxt)}`);
  };

  return <section className={styles.searchRow}>
    <SearchBarView
      action={search}
      value={txt}
      onChange={(e) => setTxt(e.target.value)}
      placeholder="Buscar música..."
    />
  </section>;
}
