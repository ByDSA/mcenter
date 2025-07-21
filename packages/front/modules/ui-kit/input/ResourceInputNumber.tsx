import { ChangeEvent, useEffect, useMemo } from "react";
import { stringToNumberOrUndefined } from "$shared/utils/data-types";
import { InputNumberProps, useInputNumber } from "./InputNumber";
import { ResourceOptionalCheckbox } from "./ResourceCheckboxOptional";
import { ResourceInputCommonProps } from "./ResourceInputCommonProps";

type V = number | undefined;

export type ResourceInputNumberProps<R extends object> = ResourceInputCommonProps<R, V> & {
  inputNumberProps?: InputNumberProps;
};

export function ResourceInputNumber<R extends object>(
  { setResource: calcUpdatedResource, getValue: getResourceValue,
    resourceState, isOptional, name, caption,
    inputNumberProps }: ResourceInputNumberProps<R>,
) {
  const [resource, setResource] = resourceState;
  const resourceValue = useMemo(
    ()=>stringToNumberOrUndefined(getResourceValue(resourceState[0])?.toString()),
    [resource],
  );
  const handleChange = useMemo(()=>(e: ChangeEvent<HTMLInputElement>) => {
    const { value: targetValue } = e.target;
    const finalValue = stringToNumberOrUndefined(targetValue);

    setResource(calcUpdatedResource(finalValue, resource));
  }, [resource]);
  const { element: inputNumber, setValue, getValue } = useInputNumber( {
    value: resourceValue,
    onChange: handleChange,
    onPressEnter: inputNumberProps?.onPressEnter ?? "nothing",
  } );

  useEffect(() => {
    const currentValue = getValue();

    if (resourceValue === currentValue)
      return;

    setValue(resourceValue ?? undefined);
  }, [resource]);

  const input = (<span className="ui-kit-resource-input-number"
  >
    <span>
      {inputNumber}
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
      } )}
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
