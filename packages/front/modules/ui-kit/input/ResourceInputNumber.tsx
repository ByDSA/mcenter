import { stringToNumberOrUndefined } from "#shared/utils/data-types";
import { ChangeEvent, useEffect, useMemo } from "react";
import { useInputNumber } from "./InputNumber";
import { ResourceOptionalCheckbox } from "./ResourceCheckboxOptional";
import { InputResourceProps } from "./props";

export default function ResourceInputNumber<T>( {prop, resourceState, isOptional}: InputResourceProps<T>) {
  const [resource, setResource] = resourceState;
  const calcFinalValue = (v?: number) => v;
  const resourceValue = useMemo(()=>calcFinalValue(stringToNumberOrUndefined(resource[prop]?.toString())), [resource]);
  const handleChange = useMemo(()=>(e: ChangeEvent<HTMLInputElement>) => {
    const {value: targetValue} = e.target;
    const finalValue = calcFinalValue(stringToNumberOrUndefined(targetValue));

    setResource( {
      ...resource,
      [prop]: finalValue,
    } );
  }, [resource]);
  const {element: inputNumber, setValue, getValue} = useInputNumber( {
    value: resourceValue,
    onChange: handleChange,
  } );

  useEffect(() => {
    const currentValue = calcFinalValue(getValue());

    if (resourceValue === currentValue)
      return;

    setValue(resourceValue ?? undefined);
  }, [resource]);

  return <span className="ui-kit-resource-input-number"
  >
    <span>
      {inputNumber}
    </span>
    <span>
      {isOptional && ResourceOptionalCheckbox( {
        prop,
        name: `${prop.toString()}-Checkbox`,
        resourceState,
      } )}
    </span>
  </span>;
}
