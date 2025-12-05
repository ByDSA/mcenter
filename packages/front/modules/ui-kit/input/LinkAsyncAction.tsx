import { useState } from "react";
import { Spinner } from "../spinner/Spinner";

type LabelAsyncActionProps = {
  title?: string;
  disabled?: boolean;
  isDoing: boolean;
  action: ()=> Promise<void>;
  children?: React.ReactNode;
  spinnerSide?: "left" | "none" | "right";
};

export function useAsyncAction() {
  const [isDoing, setIsDoing] = useState(false);

  return {
    isDoing,
    start: () => setIsDoing(true),
    done: () => setIsDoing(false),
  };
}

export function LinkAsyncAction(
  { isDoing, action, disabled, spinnerSide = "right", title, children }: LabelAsyncActionProps,
) {
  const element = (<span>
    {spinnerSide === "left" && isDoing && <Spinner size={1}/> }
    <a
      title={title}
      style={
        spinnerSide !== "none"
          ? {
            [spinnerSide === "left" ? "marginLeft" : "marginRight"]: "0.5em",
          }
          : undefined
      }
      onClick={disabled ? undefined : (() => action())}
    >
      {children}
    </a>
    {spinnerSide === "right" && isDoing && <Spinner size={1}/> }
  </span>);

  return element;
}
