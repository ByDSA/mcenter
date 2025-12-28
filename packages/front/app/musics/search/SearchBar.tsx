"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "@mui/icons-material";
import styles from "./SearchBar.module.css";

export function SearchBar() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [txt, setTxt] = useState(query);
  const router = useRouter();
  const search = () => {
    const cleanTxt = txt.trim();

    if (cleanTxt)
      router.push(`${PATH_ROUTES.musics.frontend.search.path}?q=${encodeURIComponent(cleanTxt)}`);
  };
  const before = (
    <section className={styles.searchRow}>
      <input
        type="text"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            search();
        }}
        placeholder="Buscar música..."
      />
      <span className={styles.searchButton} onClick={search}><Search/></span>
    </section>
  );

  return before;
}
