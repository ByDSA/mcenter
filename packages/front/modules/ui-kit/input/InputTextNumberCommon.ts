import { ChangeEventHandler, ReactElement } from "react";

type OnPressEnterFn<T> = (value: T | undefined)=> void;
type OnPressEnter<T> = OnPressEnterFn<T> | "newLine" | "nothing";

export type InputTextNumberCommonProps<E extends HTMLElement, T> = {
  style?: React.CSSProperties;
  disabled?: boolean;
  onChange?: ChangeEventHandler<E>;
  onPressEnter?: OnPressEnter<T>;
  value?: T;
};

type KeyDownHandlerGeneratorParams<T, E extends HTMLElement> = {
  onPressEnter?: OnPressEnter<T>;
  transformValue: (e: React.KeyboardEvent<E>)=> T | undefined;
};
export const keyDownHandlerGenerator = <T, E extends HTMLElement>( {onPressEnter, transformValue}: KeyDownHandlerGeneratorParams<T, E>) => (e: React.KeyboardEvent<E>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    if (typeof onPressEnter === "function" || onPressEnter === "nothing")
      e.preventDefault();

    if (typeof onPressEnter === "function") {
      const usedValue = transformValue(e);

      onPressEnter(usedValue);
    }
  }
};

export type InputTextNumberReturnType<T, E extends HTMLElement> = {
  element: ReactElement<E>;
  getValue: ()=> T | undefined;
  setValue: (value: T | undefined)=> void;
};