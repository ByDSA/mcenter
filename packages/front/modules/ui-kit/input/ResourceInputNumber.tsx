import { useMemo } from "react";
import { defaultValuesMap, ResourceInputProps, ResourceInputType, ResourceInputView } from "./ResourceInput";
import { useInputNumber, UseInputNumberProps } from "./UseInputNumber";
import { OnPressEnter } from "./UseInputText";
import { useOptional } from "./UseOptional";
import { UseResourceInputProps, useResourceState, useResourceSync } from "./UseResourceInput";

export type ResourceInputNumberProps<R extends object> =
  Pick<UseInputNumberProps, "onPressEnter"> & ResourceInputProps<R, number>;

export function ResourceInputNumber<R extends object>(
  { resourceState,
    originalResource,
    getUpdatedResource,
    caption,
    addOnReset,
    isOptional = false,
    getValue,
    isHidden = false,
    disabled = false,
    onPressEnter }: ResourceInputNumberProps<R>,
) {
  const { checkboxOptionalElement, mainInputElement } = useResourceInputNumber( {
    disabled,
    getUpdatedResource,
    onPressEnter,
    addOnReset,
    getValue,
    isOptional,
    defaultDefinedValue: defaultValuesMap[ResourceInputType.Number],
    resourceState,
    originalResource,
  } );

  return ResourceInputView( {
    inputElement: mainInputElement,
    type: ResourceInputType.Number,
    caption,
    checkboxOptionalElement,
    isVisible: !isHidden,
  } );
}

type UseResourceInputNumberProps<R extends object> = Omit<
  UseResourceInputProps<R, number>,
  "visualValueState"
> & {
    onPressEnter?: OnPressEnter<number>;
  };
function useResourceInputNumber<R extends object>(props: UseResourceInputNumberProps<R>) {
  const { resourceValue,
    setResourceValue } = useResourceState( {
    resourceState: props.resourceState,
    getValue: props.getValue,
    getUpdatedResource: props.getUpdatedResource,
  } );
  const { checkboxOptionalElement, checked: nullChecked,
    addOnChange: addOnOptionalChange } = useOptional( {
    isUndefined: resourceValue === undefined,
    disabled: props.disabled,
    isOptional: props.isOptional,
  } );
  const { element: mainInputElement,
    setValue: setVisualValue, value: visualValue,
    addOnChange, addOnBlur } = useInputNumber( {
    isOptional: props.isOptional,
    nullChecked,
    defaultValue: props.defaultDefinedValue,
    onPressEnter: props.onPressEnter,
    disabled: props.disabled,
  } );
  const originalResourceValue = useMemo(
    ()=>props.getValue(props.originalResource),
    [props.originalResource],
  );

  useResourceSync( {
    resourceValue,
    originalResourceValue,
    setResourceValue,
    visualValue,
    isOptional: props.isOptional,
    getValue: props.getValue,
    type: ResourceInputType.Number,
    addOnReset: props.addOnReset,
    setVisualValue,
    addOnOptionalChange,
    addOnChange,
    addOnBlur,
  } );

  return {
    mainInputElement,
    checkboxOptionalElement,
  };
}
