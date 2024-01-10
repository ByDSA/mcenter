import { HistoryMusicEntry } from "#shared/models/musics";
import React, { useEffect, useRef } from "react";
import Body from "./Body";
import Header from "./Header";
import style from "./style.module.css";

type Props = {
  value: Required<HistoryMusicEntry>;
};
export default function HistoryEntryElement( {value}: Props) {
  const showDropdownState = React.useState(false);
  const [showDropdown, setShowDropdown] = showDropdownState;
  const hasDropdownBeenShown = useRef(false);
  const [entry, setEntry] = React.useState(value);
  const {resource} = entry;
  const weightState = React.useState(value.resource.weight);
  const [currentWeight, setCurrentWeight] = weightState;
  const [isModified, setIsModified] = React.useState(false);
  const lastestState = React.useState<HistoryMusicEntry[] | undefined>(undefined);
  const [lastest, setLastest] = lastestState;

  useEffect(() => {
    if (lastest)
      hasDropdownBeenShown.current = true;
  }, [lastest]);

  useEffect(() => {
    const v = resource.weight !== currentWeight;

    setIsModified(v);
  }, [entry, currentWeight]);

  return (
    <div className={`music ${style.container}`}>
      {Header( {
        entry: value,
        resource,
        showDropdownState,
      } )}
      {showDropdown &&
      Body( {
        resource,
        weightState,
        lastest,
      } )
      }
    </div>
  );
}