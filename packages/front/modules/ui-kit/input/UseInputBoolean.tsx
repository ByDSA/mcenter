import { useId, useState } from "react";
import { UseInputProps, useOnChanges } from "./InputCommon";
import { defaultValuesMap, ResourceInputType } from "./ResourceInput";

type InputElement = HTMLInputElement;
export type InputBooleanProps = UseInputProps<boolean>;

export type UseInputBooleanProps = UseInputProps<boolean>;

export function useInputBoolean(props: UseInputBooleanProps) {
  const { defaultValue, disabled = false } = props;
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? defaultValuesMap[ResourceInputType.Boolean]);
  const { addOnChange, handleChange } = useOnChanges<boolean, InputElement>( {
    inputToValue: (t)=>t.checked,
    setValue,
    value,
  } );
  const element = (
    <input
      id={id}
      type="checkbox"
      checked={value}
      disabled={disabled}
      onChange={handleChange}
      className="ui-kit-input-boolean"
    />
  );

  return {
    element,
    value,
    setValue,
    addOnChange,
  };
}
