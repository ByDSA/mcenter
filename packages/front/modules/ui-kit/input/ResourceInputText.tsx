import { useMemo } from "react";
import { defaultValuesMap, ResourceInputProps, ResourceInputType, ResourceInputView } from "./ResourceInput";
import { OnPressEnter, useInputText, UseInputTextProps } from "./UseInputText";
import { useOptional } from "./UseOptional";
import { UseResourceInputProps, useResourceState, useResourceSync } from "./UseResourceInput";

export type ResourceInputTextProps<R extends object> =
  Pick<UseInputTextProps, "onPressEnter"> & ResourceInputProps<R, string>;

export function ResourceInputText<R extends object>(
  { resourceState,
    originalResource,
    getUpdatedResource,
    caption,
    addOnReset,
    isOptional = false,
    getValue,
    isHidden = false,
    disabled = false,
    onPressEnter }: ResourceInputTextProps<R>,
) {
  const { checkboxOptionalElement, mainInputElement } = useResourceInputText<R>( {
    disabled,
    getUpdatedResource,
    onPressEnter,
    getValue,
    addOnReset,
    isOptional,
    defaultDefinedValue: defaultValuesMap[ResourceInputType.Text],
    resourceState,
    originalResource,
  } );

  return ResourceInputView( {
    inputElement: mainInputElement,
    type: ResourceInputType.Text,
    caption,
    checkboxOptionalElement,
    isVisible: !isHidden,
  } );
}
type UseResourceInputTextProps<R extends object> = Omit<
  UseResourceInputProps<R, string>,
  "visualValueState"
> & {
    onPressEnter?: OnPressEnter<string>;
  };

function useResourceInputText<R extends object>(
  props: UseResourceInputTextProps<R>,
) {
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
    setValue: setVisualValue, value: visualValue, addOnChange } = useInputText( {
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
    addOnReset: props.addOnReset,
    type: ResourceInputType.Text,
    visualValue,
    isOptional: props.isOptional,
    setVisualValue,
    addOnOptionalChange,
    addOnChange,
  } );

  return {
    mainInputElement,
    checkboxOptionalElement,
  };
}
