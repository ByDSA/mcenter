import { HistoryMusicEntry } from "#shared/models/musics";
import React, { useEffect, useRef } from "react";
import Body from "./Body";
import Header from "./Header";
import style from "./style.module.css";

type Props = {
  value: Required<HistoryMusicEntry>;
  showDate?: boolean;
};
export default function HistoryEntryElement( {value, showDate = true}: Props) {
  const showDropdownState = React.useState(false);
  const [showDropdown, setShowDropdown] = showDropdownState;
  const hasDropdownBeenShown = useRef(false);
  const [entry, setEntry] = React.useState(value);
  const {resource, resourceId} = entry;
  const weightState = React.useState(value.resource.weight);
  const [currentWeight] = weightState;
  const [isModified, setIsModified] = React.useState(false);

  useEffect(() => {
    const v = resource.weight !== currentWeight;

    setIsModified(v);
  }, [entry, currentWeight]);

  return (
    <div className={`music ${style.container}`}>
      {Header( {
        entry: value,
        showDate,
        resource,
        showDropdownState,
      } )}
      {showDropdown &&
      Body( {
        resource,
        resourceId,
        weightState,
      } )
      }
    </div>
  );
}