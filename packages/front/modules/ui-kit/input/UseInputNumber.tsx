import { useId, useMemo, useState } from "react";
import { UseInputProps, keyDownHandlerGenerator, useOnChanges } from "./InputCommon";
import { OnPressEnter } from "./UseInputText";

type InputElement = HTMLInputElement;

export type UseInputNumberProps = UseInputProps<number> & {
  onPressEnter?: OnPressEnter<number>;
};

export function useInputNumber(props: UseInputNumberProps) {
  const { onPressEnter, defaultValue, disabled = false } = props;
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const { addOnChange, handleChange } = useOnChanges<number | null, InputElement>( {
    inputToValue: (t) =>t.value === "" ? null : +t.value,
    setValue: (newValue: number | undefined) => setValue(newValue ? newValue.toString() : ""),
    value: value === "" ? null : +value,
  } );
  const keyDownHandler = useMemo(() => keyDownHandlerGenerator<number | null, InputElement>( {
    onPressEnter: onPressEnter,
    value: value === "" ? null : +value,
  } ), [onPressEnter, value]);
  const element = <input
    id={id}
    type="number"
    disabled={disabled}
    value={value}
    className="ui-kit-input-number"
    onChange={handleChange}
    onKeyDown={keyDownHandler}
  />;

  return {
    element,
    value: value === "" ? null : +value,
    setValue: (newValue: number | null) => setValue(newValue ? newValue.toString() : ""),
    addOnChange,
  };
}
