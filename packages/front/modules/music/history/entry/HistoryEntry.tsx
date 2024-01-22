
import { HistoryMusicEntry } from "#shared/models/musics";
import "#styles/resources/history-entry.css";
import "#styles/resources/music.css";
import React from "react";
import Body from "./body/Body";
import Header from "./header/Header";
import style from "./style.module.css";

type Props<T> = {
  value: Required<T>;
  showDate?: boolean;
};
export default function HistoryEntryElement( {value: entry, showDate = true}: Props<HistoryMusicEntry>) {
  const [isBodyVisible, setBodyVisible] = React.useState(false);
  const toggleShowBody = () => {
    setBodyVisible(!isBodyVisible);
  };

  return (
    <div className={`${style.container}`}>
      {
        Header( {
          entry,
          showDate,
          toggleShowBody,
        } )
      }
      {
        Body( {
          isBodyVisible,
          entry,
        } )
      }
    </div>
  );
}
