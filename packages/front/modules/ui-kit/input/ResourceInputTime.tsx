import { useMemo } from "react";
import { ResourceInputProps, ResourceInputType, ResourceInputView } from "./ResourceInput";
import { OnPressEnter } from "./UseInputText";
import { useOptional } from "./UseOptional";
import { UseResourceInputProps, useResourceState, useResourceSync } from "./UseResourceInput";
import { UseInputTimeProps, useInputTime } from "./UseInputTime";

export type ResourceInputTimeProps<R extends object> =
  Pick<UseInputTimeProps, "onPressEnter"> & ResourceInputProps<R, number>;

export function ResourceInputTime<R extends object>(
  { resourceState,
    originalResource,
    getUpdatedResource,
    caption,
    addOnReset,
    isOptional = false,
    getValue,
    isHidden = false,
    disabled = false,
    onPressEnter }: ResourceInputTimeProps<R>,
) {
  const { checkboxOptionalElement, mainInputElement } = useResourceInputTime( {
    disabled,
    getUpdatedResource,
    onPressEnter,
    addOnReset,
    getValue,
    isOptional,
    defaultDefinedValue: 0,
    resourceState,
    originalResource,
  } );

  return ResourceInputView( {
    inputElement: mainInputElement,
    type: ResourceInputType.Number, // Usamos Number porque internamente es un número
    caption,
    checkboxOptionalElement,
    isVisible: !isHidden,
  } );
}

// Hook personalizado para input de tiempo
type UseResourceInputTimeProps<R extends object> = Omit<
  UseResourceInputProps<R, number>,
  "visualValueState"
> & {
  onPressEnter?: OnPressEnter<number>;
};

function useResourceInputTime<R extends object>(props: UseResourceInputTimeProps<R>) {
  const { resourceValue, setResourceValue } = useResourceState( {
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
    addOnChange, addOnBlur } = useInputTime( {
    isOptional: props.isOptional,
    nullChecked,
    defaultValue: props.defaultDefinedValue,
    onPressEnter: props.onPressEnter,
    disabled: props.disabled,
  } );
  const originalResourceValue = useMemo(
    () => props.getValue(props.originalResource),
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
