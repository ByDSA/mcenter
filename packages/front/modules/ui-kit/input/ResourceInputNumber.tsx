import { useMemo } from "react";
import { ResourceInputProps, ResourceInputView } from "./ResourceInput";
import { useInputNumber, UseInputNumberProps } from "./UseInputNumber";
import { OnPressEnter } from "./UseInputText";
import { useOptional } from "./UseOptional";
import { UseResourceInputProps, useResourceState, useResourceSync } from "./UseResourceInput";

export type ResourceInputNumberProps<R extends object> =
  ResourceInputProps<R, number> & {
    inputNumberProps?: UseInputNumberProps;
  };

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
    inputNumberProps }: ResourceInputNumberProps<R>,
) {
  const { checkboxOptionalElement, mainInputElement } = useResourceInputNumber( {
    disabled,
    getUpdatedResource,
    onPressEnter: inputNumberProps?.onPressEnter,
    addOnReset,
    getValue,
    isOptional,
    defaultDefinedValue: 1,
    resourceState,
    originalResource,
  } );

  return ResourceInputView( {
    inputElement: mainInputElement,
    type: "number",
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
    setValue: setVisualValue, value: visualValue, addOnChange } = useInputNumber( {
    defaultValue: props.defaultDefinedValue,
    onPressEnter: props.onPressEnter,
    disabled: props.disabled || nullChecked,
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
    isNumber: true,
    addOnReset: props.addOnReset,
    setVisualValue,
    addOnOptionalChange,
    addOnChange,
  } );

  return {
    mainInputElement,
    checkboxOptionalElement,
  };
}
