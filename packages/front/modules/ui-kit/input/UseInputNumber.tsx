import { FocusEventHandler, useId, useMemo, useRef, useState } from "react";
import { classes } from "#modules/utils/styles";
import { UseInputProps, keyDownHandlerGenerator, useObserver, useOnChanges } from "./InputCommon";
import { OnPressEnter } from "./UseInputText";
import { defaultValuesMap, ResourceInputType } from "./ResourceInput";

type InputElement = HTMLInputElement;

export type UseInputNumberProps = UseInputProps<number> & {
  onPressEnter?: OnPressEnter<number>;
  isOptional?: boolean;
  minDigits?: number;
};
const stringValueToNumber = (value: string | undefined) => value === "" || value === undefined
  ? null
  : +value;
const numberValueToString = (value: number | null, minDigits: number | undefined)=> {
  if (value === null)
    return defaultValuesMap[ResourceInputType.Text];

  if (minDigits !== undefined)
    return value.toString().padStart(minDigits, "0");

  return value.toString();
};

export function useInputNumber(props: UseInputNumberProps) {
  const { onPressEnter, defaultValue, isOptional, disabled = false, minDigits } = props;
  const id = useId();
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(
    (isOptional
      ? defaultValuesMap[ResourceInputType.Text]
      : defaultValue)?.toString(),
  );
  const { addOnChange, handleChange, callHandle } = useOnChanges<number |
    null, InputElement>( {
      inputToValue: (t) =>{
        if (t.value === "")
          return null;

        return +t.value;
      },
      setValue: (newValue: number | null) => setValue(numberValueToString(newValue, minDigits)),
      value: stringValueToNumber(value),
    } );
  const { addObserver: addOnBlur, handle: innerHandleBlur } = useObserver<void[]>();
  const handleBlur: FocusEventHandler<HTMLInputElement> = (_e) => {
    innerHandleBlur();
  };
  const keyDownHandler = useMemo(() => keyDownHandlerGenerator<number | null, InputElement>( {
    onPressEnter,
    value: stringValueToNumber(value),
  } ), [onPressEnter, value]);
  const element = <input
    id={id}
    ref={ref}
    type="number"
    disabled={disabled}
    value={value}
    className={classes("ui-kit-input-number", props.nullChecked ? "is-null" : "")}
    onChange={handleChange}
    onKeyDown={keyDownHandler}
    onBlur={handleBlur}
  />;

  return {
    element,
    ref,
    value: stringValueToNumber(value),
    setValue: (newValue: number | null) => setValue(numberValueToString(newValue, minDigits)),
    addOnChange,
    addOnBlur,
    callHandle,
  };
}
