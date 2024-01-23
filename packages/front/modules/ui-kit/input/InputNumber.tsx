import { numberToStringOrEmpty, stringToNumberOrUndefined } from "#shared/utils/data-types";
import { useMemo, useRef } from "react";
import { InputTextNumberCommonProps, keyDownHandlerGenerator } from "./InputTextNumberCommon";

type InputElement = HTMLInputElement;

type InputNumberProps = InputTextNumberCommonProps<InputElement, number>;
/* eslint-disable import/prefer-default-export */
export function useInputNumber( {value, onPressEnter = "nothing", onChange}: InputNumberProps) {
  const ref = useRef(null as InputElement | null);
  const keyDownHandler = useMemo(()=>keyDownHandlerGenerator<number, InputElement>( {
    onPressEnter,
    transformValue: e =>stringToNumberOrUndefined(e.currentTarget.value),
  } ), [onPressEnter]);
  const inputElement = useMemo(()=><input
    ref={ref}
    type="number"
    value={numberToStringOrEmpty(value)}
    className="ui-kit-input-number"
    onChange={onChange}
    onKeyDown={keyDownHandler}
  />, [onChange, onPressEnter]);

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