import { FocusEventHandler, useId, useMemo, useState } from "react";
import { classes } from "#modules/utils/styles";
import { UseInputProps, keyDownHandlerGenerator, useObserver, useOnChanges } from "./InputCommon";
import { OnPressEnter } from "./UseInputText";
import { defaultValuesMap, ResourceInputType } from "./ResourceInput";

type InputElement = HTMLInputElement;

export type UseInputNumberProps = UseInputProps<number> & {
  onPressEnter?: OnPressEnter<number>;
  isOptional?: boolean;
};
const stringValueToNumber = (value: string | undefined) => value === "" || value === undefined
  ? null
  : +value;
const numberValueToString = (value: number | null)=> {
  if (value === null)
    return defaultValuesMap[ResourceInputType.Text];

  return value.toString();
};

export function useInputNumber(props: UseInputNumberProps) {
  const { onPressEnter, defaultValue, isOptional, disabled = false } = props;
  const id = useId();
  const [value, setValue] = useState(
    (isOptional
      ? defaultValuesMap[ResourceInputType.Text]
      : defaultValue)?.toString(),
  );
  const { addOnChange, handleChange } = useOnChanges<number | null, InputElement>( {
    inputToValue: (t) =>{
      if (t.value === "")
        return null;

      return +t.value;
    },
    setValue: (newValue: number | null) => setValue(numberValueToString(newValue)),
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
    value: stringValueToNumber(value),
    setValue: (newValue: number | null) => setValue(numberValueToString(newValue)),
    addOnChange,
    addOnBlur,
  };
}
