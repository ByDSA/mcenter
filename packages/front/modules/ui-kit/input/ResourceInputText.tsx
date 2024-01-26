import { ChangeEvent, useEffect, useMemo } from "react";
import { InputTextProps, useInputText } from "./InputText";
import { ResourceOptionalCheckbox } from "./ResourceCheckboxOptional";
import { ResourceInputCommonProps } from "./ResourceInputCommonProps";

export type ResourceInputTextProps<R> = ResourceInputCommonProps<R> & {
  inputTextProps?: InputTextProps;
};

export default function ResourceInputText<R extends Object>( {resourceState, prop: key, isOptional, error, inputTextProps}: ResourceInputTextProps<R>) {
  const [resource, setResource] = resourceState;
  const calcFinalValue = (v?: string) => {
    if (v === "" && isOptional)
      return undefined;

    if (v === undefined && !isOptional)
      return "";

    return v;
  };
  const initialValue = useMemo(()=>calcFinalValue(resource[key]?.toString()), [resource]);
  const handleChange = useMemo(()=>(e: ChangeEvent<HTMLTextAreaElement>) => {
    const {value: targetValue} = e.target;
    const finalValue = calcFinalValue(targetValue);

    setResource( {
      ...resource,
      [key]: finalValue,
    } );
  }, [resource]);
  const {element: inputText, setValue, getValue} = useInputText( {
    value: initialValue,
    onChange: handleChange,
    ...inputTextProps,
  } );

  useEffect(() => {
    const currentValue = calcFinalValue(getValue());

    if (initialValue === currentValue)
      return;

    setValue(initialValue ?? "");
  }, [resource]);

  return <span className="ui-kit-resource-input-text">
    <span>
      {inputText}
      {error && <span className="error">{error}</span>}
    </span>
    <span>
      {isOptional && ResourceOptionalCheckbox( {
        prop: key,
        resourceState,
        name: `${key.toString()}-Checkbox`,
      } ) }
    </span>
  </span>;
}