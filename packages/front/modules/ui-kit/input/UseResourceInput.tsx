import { useState, useEffect, useCallback, useRef } from "react";
import { AddOnReset } from "#modules/utils/resources/useCrud";
import { defaultValuesMap, ResourceInputProps, ResourceInputType } from "./ResourceInput";
import { useOptional } from "./UseOptional";
import { AddOnChange, OnChange } from "./InputCommon";

export type UseResourceInputProps<R extends object, V> =
  ResourceInputProps<R, V> & {
  defaultDefinedValue: V;
  visualValueState: ReturnType<typeof useState<V>>;
};

// Hook general para cualquier tipo de input
export function useResourceInput<R extends object, V>(
  { resourceState: [resource, setResource],
    getValue,
    getUpdatedResource,
    isOptional,
    disabled,
    visualValueState: [visualValue, setVisualValue],
    defaultDefinedValue }: UseResourceInputProps<R, V>,
) {
  // Valores derivados del recurso
  const resourceValue = getValue(resource);

  useEffect(() => {
    if (resourceValue !== undefined)
      setVisualValue(resourceValue);
  }, [resourceValue, setVisualValue]);
  // Handler para cambios en el input principal
  const setResourceValue = useCallback((newValue: V | undefined) => {
    setVisualValue(newValue ?? defaultDefinedValue);

    const newResource = getUpdatedResource(newValue, resource);

    setResource(newResource);
  }, [setResource, getUpdatedResource, resource, setVisualValue, defaultDefinedValue]);
  // Handler para el checkbox opcional
  const handleOptionalChange = useCallback((nullChecked: boolean) => {
    if (nullChecked) {
      // Convertir a undefined pero mantener el visualValue
      const newResource = getUpdatedResource(undefined, resource);

      setResource(newResource);
    } else {
      // Restaurar usando el visualValue actual
      const newResource = getUpdatedResource(visualValue, resource);

      setResource(newResource);
    }
  }, [setResource, getUpdatedResource, resource, visualValue]);
  // Usar el hook de opcional
  const { checkboxOptionalElement, checked: nullChecked,
    addOnChange: addOnOptionalChange } = useOptional( {
    isUndefined: getValue(resource) === undefined,
    disabled,
  } );

  useEffect(()=>{
    addOnOptionalChange(handleOptionalChange);
  }, []);

  return {
    resourceValue,
    setResourceValue,
    checkboxOptionalElement: isOptional ? checkboxOptionalElement : null,
    disabled: disabled || (isOptional && nullChecked),
  };
}

type UseResourceState<R extends object, V> = {
  resourceState: readonly [R, (newResource: R)=> void];
  getValue: (resource: R)=> V | undefined;
  getUpdatedResource: (newValue: V | undefined, oldResource: R)=> R;
};
export function useResourceState<R extends object, V>( { resourceState: [resource, setResource],
  getValue,
  getUpdatedResource }: UseResourceState<R, V>) {
  const resourceValue = getValue(resource);
  // Handler básico para cambios de recurso
  const setResourceValue = useCallback((newValue: V | undefined) => {
    const newResource = getUpdatedResource(newValue, resource);

    setResource(newResource);
  }, [setResource, getUpdatedResource, resource]);

  return {
    resourceValue,
    setResourceValue,
  };
}
type UseResourceSyncProps<T> = {
  resourceValue: T | undefined;
  originalResourceValue: T;
  setResourceValue: (value: T | undefined)=> void;
  visualValue: T;
  type: ResourceInputType;
  setVisualValue: (value: T)=> void;
  addOnChange: AddOnChange<T>;
  addOnOptionalChange: AddOnChange<boolean>;
  addOnReset?: AddOnReset<unknown>;
};

export function useResourceSync<T>( { resourceValue,
  visualValue,
  setResourceValue,
  addOnReset,
  addOnChange,
  addOnOptionalChange,
  type,
  originalResourceValue,
  setVisualValue }: UseResourceSyncProps<T>) {
  useEffect(() => {
    onChangeRef.current = (newValue) => {
      if (newValue === null && type === ResourceInputType.Number) {
        setResourceValue(originalResourceValue);

        return;
      }

      setResourceValue(newValue);
    };
  }, [setResourceValue, originalResourceValue, type]);

  useEffect(() => {
    onOptionalChangeRef.current = (nullChecked) => {
      if (nullChecked)
        setResourceValue(undefined);
      else {
        const v = visualValue ?? defaultValuesMap[type] as T;

        setVisualValue(v);
        setResourceValue(v);
      }
    };
  }, [setResourceValue, setVisualValue, visualValue, type]);

  const originalResourceValueRef = useRef<T>(originalResourceValue);

  useEffect(() => {
    // Initial Visual State
    if (visualValue !== resourceValue && resourceValue !== undefined)
      setVisualValue(resourceValue);

    addOnReset?.(() => {
      if (originalResourceValueRef.current !== undefined)
        setVisualValue(originalResourceValueRef.current);
    } );
  }, []);

  useEffect(() => {
    originalResourceValueRef.current = originalResourceValue;
  }, [originalResourceValue]);

  const onChangeRef = useRef<OnChange<T> | null>(null);

  useEffect(()=> {
    addOnChange((newValue, oldValue)=> {
      onChangeRef.current?.(newValue, oldValue);
    } );
  }, []);

  const onOptionalChangeRef = useRef<OnChange<boolean> | null>(null);

  useEffect(()=> {
    addOnOptionalChange((newValue, oldValue)=> {
      onOptionalChangeRef.current?.(newValue, oldValue);
    } );
  }, []);
}
