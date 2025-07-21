import { ChangeEvent, useEffect, useMemo } from "react";
import { InputTextProps, useInputText } from "./InputText";
import { ResourceOptionalCheckbox } from "./ResourceCheckboxOptional";
import { ResourceInputCommonProps } from "./ResourceInputCommonProps";

export type ResourceInputTextProps<R> = ResourceInputCommonProps<R, string | undefined> & {
  inputTextProps?: InputTextProps;
};

export function ResourceInputText<R extends object>(
  { resourceState, setResource: calcUpdatedResource, caption,
    getValue: getResourceValue, isOptional, error, inputTextProps, name }: ResourceInputTextProps<R>,
) {
  const [resource, setResource] = resourceState;
  const calcFinalValue = (v?: string) => {
    if (v === "" && isOptional)
      return undefined;

    if (v === undefined && !isOptional)
      return "";

    return v;
  };
  const initialValue = useMemo(()=> calcFinalValue(
    getResourceValue(resourceState[0])?.toString(),
  ), [resource]);
  const handleChange = useMemo(()=>(e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value: targetValue } = e.target;
    const finalValue = calcFinalValue(targetValue);

    setResource(calcUpdatedResource(finalValue, resource));
  }, [resource]);
  const { element: inputText, setValue, getValue } = useInputText( {
    value: initialValue!,
    onChange: handleChange,
    ...inputTextProps,
  } );

  useEffect(() => {
    const currentValue = calcFinalValue(getValue());

    if (initialValue === currentValue)
      return;

    setValue(initialValue ?? "");
  }, [resource]);

  const input = (<span className="ui-kit-resource-input-text">
    <span>
      {inputText}
      {error && <span className="error">{error}</span>}
    </span>
    <span>
      {isOptional && ResourceOptionalCheckbox( {
        setResource: (
          newValue: boolean | undefined,
          old,
        ) => newValue ? old : !!getResourceValue(resourceState[0]),
        getValue: () => !!getResourceValue(resourceState[0]),
        resourceState,
        name: `${name.toString()}-Checkbox`,
      } ) }
    </span>
  </span>);

  if (caption) {
    return <span className="ui-kit-resource-input">
      <span>{caption}</span>
      {input}
    </span>;
  }

  return input;
}
