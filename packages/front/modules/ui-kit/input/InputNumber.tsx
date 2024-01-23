import { numberToStringOrEmpty, stringToNumberOrUndefined } from "#shared/utils/data-types";
import { useMemo, useRef } from "react";
import { InputTextProps } from "./InputText";

type InputElement = HTMLInputElement;

type InputNumberProps = Omit<InputTextProps, "keyDownHandler" | "onChange" | "value"> & {
  onChange?: (e: React.ChangeEvent<InputElement>)=> void;
  onPressEnter?: (n: number)=> void;
  value?: number;
};
/* eslint-disable import/prefer-default-export */
export function useInputNumber( {value, onPressEnter, onChange}: InputNumberProps) {
  const ref = useRef(null as InputElement | null);
  const keyDownHandler = (e: React.KeyboardEvent<InputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof onPressEnter === "function" || onPressEnter === "nothing")
        e.preventDefault();

      if (typeof onPressEnter === "function")
        onPressEnter(e.currentTarget.value);
    }
  };
  const updateProps = [onChange, onPressEnter];
  const inputElement = useMemo(()=><input
    ref={ref}
    type="number"
    value={numberToStringOrEmpty(value)}
    className="ui-kit-input-number"
    onChange={onChange}
    onKeyDown={keyDownHandler}
  />, updateProps);

  return {
    element: inputElement,
    getValue:()=>stringToNumberOrUndefined(ref?.current?.value),
    setValue: (v: number | undefined) => {
      if (!ref?.current)
        return;

      ref.current.value = numberToStringOrEmpty(v);
    },
  };
}