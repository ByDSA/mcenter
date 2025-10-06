import { useState, ChangeEventHandler, useMemo, ChangeEvent, useCallback } from "react";

type OnPressEnterFn<T> = (value: T | undefined)=> void;
type OnPressEnter<T> = OnPressEnterFn<T> | "newLine" | "nothing";

export type OnChange<T> = (newValue: T, oldValue: T)=> void;

export type AddOnChange<T> = (newOnChange: OnChange<T>)=> void;

export type UseInputProps<T> = {
  nullChecked: boolean;
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
  const { addObserver: addOnChange, handle } = useObserver<[T, T]>();
  const handleChange: ChangeEventHandler<E> = useMemo(() => {
    return (e: ChangeEvent<E>) => {
      const newValue = inputToValue(e.target);
      const oldValue = value;

      setValue(newValue);

      handle(newValue, oldValue);
    };
  }, [value, handle]);

  return {
    addOnChange,
    handleChange,
    callHandle: handle,
  };
}

export type Observer<Args extends unknown[]> = (...params: Args)=> void;

export function useObserver<Args extends unknown[]>() {
  const [observers, setObservers] = useState<Observer<Args>[]>([]);
  const addObserver = useCallback((observer: Observer<Args>) => {
    setObservers(prev => [...prev, observer]);
  }, []);
  const handle = useCallback((...params: Args) => {
    observers.forEach(observer => observer(...params));
  }, [observers]);

  return {
    handle,
    addObserver,
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
