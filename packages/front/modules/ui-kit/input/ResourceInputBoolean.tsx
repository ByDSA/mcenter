import { useMemo } from "react";
import { defaultValuesMap, ResourceInputProps, ResourceInputType, ResourceInputView } from "./ResourceInput";
import { useInputBoolean } from "./UseInputBoolean";
import { useOptional } from "./UseOptional";
import { UseResourceInputProps, useResourceState, useResourceSync } from "./UseResourceInput";

export type ResourceInputBooleanProps<R extends object> = ResourceInputProps<R, boolean>;

export function ResourceInputBoolean<R extends object>(
  { getUpdatedResource, getValue, resourceState, originalResource, addOnReset, caption, disabled =
  false, isHidden = false, isOptional = false }: ResourceInputBooleanProps<R>,
) {
  const { checkboxOptionalElement, mainInputElement } = useResourceInputBoolean( {
    disabled,
    getUpdatedResource,
    getValue,
    addOnReset,
    isOptional,
    defaultDefinedValue: defaultValuesMap[ResourceInputType.Boolean],
    resourceState,
    originalResource,
  } );

  return ResourceInputView( {
    inputElement: mainInputElement,
    type: ResourceInputType.Boolean,
    caption,
    checkboxOptionalElement,
    isVisible: !isHidden,
  } );
}

type UseResourceInputBooleanProps<R extends object> =
  Omit<UseResourceInputProps<R, boolean>, "visualValueState">;
function useResourceInputBoolean<R extends object>(props: UseResourceInputBooleanProps<R>) {
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
    setValue: setVisualValue, value: visualValue, addOnChange } = useInputBoolean( {
    nullChecked,
    defaultValue: props.defaultDefinedValue,
    disabled: props.disabled || nullChecked,
  } );
  const originalResourceValue = useMemo(
    ()=>props.getValue(props.originalResource),
    [props.originalResource],
  );

  useResourceSync( {
    resourceValue,
    originalResourceValue,
    addOnReset: props.addOnReset,
    setResourceValue,
    getValue: props.getValue,
    isOptional: props.isOptional,
    type: ResourceInputType.Boolean,
    visualValue,
    setVisualValue,
    addOnOptionalChange,
    addOnChange,
  } );

  return {
    mainInputElement,
    checkboxOptionalElement,
  };
}
