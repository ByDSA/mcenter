import { JsonViewer } from "@textea/json-viewer";
import { useState, useEffect, useRef } from "react";
import { ExpandableContainer } from "#modules/ui-kit/expandable/Expandable";

type Props = {
  value: object;
  collapseStringsAfterLength?: number;
};

export const TaskJsonViewer = ( { value,
  collapseStringsAfterLength = calculateLength() }: Props) =>{
  return <ExpandableContainer>
    <JsonViewer
      value={value}
      rootName={false}
      displayDataTypes={false}
      indentWidth={2}
      theme={"dark"}
      groupArraysAfterLength={20}
      highlightUpdates={true}
      // No funciona con state, no se vuelve a asignar:
      collapseStringsAfterLength={collapseStringsAfterLength ?? null}
    /></ExpandableContainer>;
};

const calculateLength = () => {
  const width = window.innerWidth;

  if (width < 640)
    return 30;

  if (width < 768)
    return 50;

  if (width < 1024)
    return 70;

  if (width < 1280)
    return 105;

  return 150;
};

export const useResponsiveCollapseLength = () => {
  const [collapseLength, setCollapseLength] = useState(0);
  const setStateRef = useRef(setCollapseLength);

  setStateRef.current = setCollapseLength;

  useEffect(() => {
    const initialValue = calculateLength();

    setCollapseLength(initialValue);

    const handleResize = () => {
      const newValue = calculateLength();

      setCollapseLength(newValue);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return collapseLength;
};
