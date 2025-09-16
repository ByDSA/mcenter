"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MusicList } from "#modules/musics/musics/MusicList";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import MusicLayout from "../music.layout";

export default function Search() {
  const [filters, setFilters] = useState<Parameters<typeof MusicList>[0]["filters"]>( {} );
  const titleFilterRef = useRef("");
  const onPressEnter = useCallback(() => {
    setFilters(old => ( {
      ...old,
      title: titleFilterRef.current,
    } ));
  }, []);
  const { element: searchInput, value: titleFilterValue } = useInputText( {
    nullChecked: false,
    onPressEnter,
    autofocus: true,
  } );

  useEffect(() => {
    titleFilterRef.current = titleFilterValue;
  }, [titleFilterValue]);

  return (
    <MusicLayout>
      <h2>Search</h2>
      <span style={{
        display: "flex",
        flexFlow: "row",
        gap: "1rem",
      }}>
        {
          searchInput
        }
        <button onClick={onPressEnter}>Buscar</button>
      </span>
      {
        MusicList( {
          filters,
        } )
      }
    </MusicLayout>
  );
}
