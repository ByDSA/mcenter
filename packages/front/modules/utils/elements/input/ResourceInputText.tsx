import { isDefined } from "#shared/utils/validation";
import { ChangeEvent, useEffect, useState } from "react";
import { InputText } from "./InputText";
import OptionalCheckbox from "./OptionalCheckbox";
import { InputResourceProps } from "./props";

export default function ResourceInputText<T extends Object>( {resourceState, style, prop: key, isOptional, error}: InputResourceProps<T>) {
  const [resource, setResource] = resourceState;
  const [value, setValue] = useState(resource[key]?.toString());

  useEffect(() => {
    setValue(resource[key]?.toString());
  },[resource]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const {value: targetValue} = e.target;
    const finalValue = targetValue === "" && isOptional ? undefined : targetValue;

    setResource( {
      ...resource,
      [key]: finalValue,
    } );
  };
  const disabled = isOptional && !isDefined(value);
  const textArea = <InputText
    style={{
      width: "100%",
    }}
    value={value}
    disabled={disabled}
    onChange={handleChange}></InputText>;

  return <span style={{
    flexFlow: "column",
    width: "100%",
    ...style,
  }}>
    <span style={{
      width: "100%",
    }}>
      {textArea}
      {isOptional && OptionalCheckbox( {
        prop: key,
        resourceState,
        defaultValue: "",
        name: `${key.toString()}-Checkbox`,
      } ) }
    </span>
    {error && <span className="error">{error}</span>}
  </span>;
}