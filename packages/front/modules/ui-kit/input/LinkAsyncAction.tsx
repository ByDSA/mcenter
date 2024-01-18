import { useState } from "react";
import { Spinner } from "../spinner/Spinner";

/* eslint-disable import/prefer-default-export */
type LabelAsyncActionProps = {
  isDoing: boolean;
  action: ()=> Promise<void>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  spinnerSide?: "left" | "right";
};

export function useAsyncAction() {
  const [isDoing, setIsDoing] = useState(false);

  return {
    isDoing,
    start: () => setIsDoing(true),
    done: () => setIsDoing(false),
  };
}

export function LinkAsyncAction( {isDoing, action, spinnerSide = "right", style, children}: LabelAsyncActionProps) {
  const element = (<span>
    {spinnerSide === "left" && isDoing && <Spinner/> }
    <a style={{
      ...style,
      cursor: "pointer",
      [spinnerSide === "left" ? "marginLeft" : "marginRight"]: "0.5em",
    }} onClick={()=> action()}>{children}</a>
    {spinnerSide === "right" && isDoing && <Spinner/> }
  </span>);

  return element;
}