import { isDefined } from "#shared/utils/validation";
import OptionalCheckbox from "./OptionalCheckbox";
import { InputResourceProps } from "./props";

export default function ResourceInputNumber<T>( {prop, resourceState, isOptional}: InputResourceProps<T>) {
  const [resource, setResource] = resourceState;
  const checkboxName = `${prop.toString()}-Checkbox`;
  const value = isDefined(resource[prop]) ? +resource[prop] : "";

  return <span className="ui-kit-resource-input-number"
  >
    <span>
      <input
        type="number"
        value={value}
        className="ui-kit-input-number"
        disabled={isOptional && !isDefined(resource[prop])}
        onChange={handleOnChange((v: number) => {
          setResource( {
            ...resource,
            [prop]: v,
          } );
        } )}/>
    </span>
    <span>
      {isOptional && OptionalCheckbox( {
        prop,
        name: checkboxName,
        resourceState,
        defaultValue: 0,
      } )}
    </span>
  </span>;
}

function handleOnChange(f: React.Dispatch<React.SetStateAction<number>>) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;

    f(v);
  };
}