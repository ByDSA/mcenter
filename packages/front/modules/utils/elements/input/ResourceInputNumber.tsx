import { isDefined } from "#shared/utils/validation";
import OptionalCheckbox from "./OptionalCheckbox";
import { InputResourceProps } from "./props";
import { commonStyle } from "./style";

export default function ResourceInputNumber<T>( {prop, style, resourceState, isOptional}: InputResourceProps<T>) {
  const [resource, setResource] = resourceState;
  const checkboxName = `${prop.toString()}-Checkbox`;
  const value = isDefined(resource[prop]) ? +resource[prop] : "";

  return <span style={{
    width: style?.width ?? "100%",
    ...style,
  }}><input
      style={commonStyle}
      type="number"
      value={value}
      disabled={isOptional && !isDefined(resource[prop])}
      onChange={handleOnChange((v: number) => {
        setResource( {
          ...resource,
          [prop]: v,
        } );
      } )}/>
    {isOptional && OptionalCheckbox( {
      prop,
      name: checkboxName,
      resourceState,
      defaultValue: 0,
    } )}
  </span>;
}

function handleOnChange(f: React.Dispatch<React.SetStateAction<number>>) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;

    f(v);
  };
}