import { ChangeEvent, useEffect, useMemo } from "react";
import { useInputText } from "./InputText";
import OptionalCheckbox from "./OptionalCheckbox";
import { InputResourceProps } from "./props";

export default function ResourceInputText<T extends Object>( {resourceState, prop: key, isOptional, error, inputTextProps: inputTextPropsMod}: InputResourceProps<T>) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {onEmptyPressEnter:_, ...inputTextProps} = inputTextPropsMod ?? {
  };
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

  return <>
    <span className="ui-kit-resource-input-text">
      <span>
        {inputText}
        {error && <span className="error">{error}</span>}
      </span>
      <span>
        {isOptional && OptionalCheckbox( {
          prop: key,
          resourceState,
          name: `${key.toString()}-Checkbox`,
        } ) }
      </span>
    </span>
  </>;
}