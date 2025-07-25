import { useState, ChangeEventHandler, useMemo, ChangeEvent, useCallback } from "react";

type OnPressEnterFn<T> = (value: T | undefined)=> void;
type OnPressEnter<T> = OnPressEnterFn<T> | "newLine" | "nothing";

export type OnChange<T> = (newValue: T, oldValue: T)=> void;

export type AddOnChange<T> = (newOnChange: OnChange<T>)=> void;

export type UseInputProps<T> = {
  defaultValue?: T;
  onChange?: OnChange<T>;
  disabled?: boolean;
};

type InputToValueFn<T, E extends Element> = (input: E)=> T;
type UseOnChangesProps<T, E extends Element> = {
  value: T;
  setValue: ReturnType<typeof useState<T>>[1];
  inputToValue: InputToValueFn<T, E>;
};
export function useOnChanges<T, E extends Element>( { value,
  setValue,
  inputToValue }: UseOnChangesProps<T, E>) {
  const [onChanges, setOnChanges] = useState<OnChange<T>[]>([]);
  const addOnChange: AddOnChange<T> = useCallback((newOnChange: OnChange<T>) => {
    setOnChanges((old) => ([...old, newOnChange]));
  }, [setOnChanges]);
  const handleChange: ChangeEventHandler<E> = useMemo(() => {
    return (e: ChangeEvent<E>) => {
      const newValue = inputToValue(e.target);
      const oldValue = value;

      setValue(newValue);

      for (const o of onChanges)
        o(newValue, oldValue);
    };
  }, [value, onChanges]);

  return {
    addOnChange,
    handleChange,
  };
}

type KeyDownHandlerGeneratorParams<T> = {
  onPressEnter?: OnPressEnter<T>;
  value: T;
};
export const keyDownHandlerGenerator = <T, E extends Element>(
  { onPressEnter,
    value }: KeyDownHandlerGeneratorParams<T>) => (e: React.KeyboardEvent<E>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof onPressEnter === "function" || onPressEnter === "nothing")
        e.preventDefault();

      if (typeof onPressEnter === "function")
        onPressEnter(value);
    }
  };
