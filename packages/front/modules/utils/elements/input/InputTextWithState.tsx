/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { JSX, useState } from "react";
import { InputText, InputTextProps } from "./InputText";

type UseInputTextWithStateRet = {
  state: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>];
  element: JSX.Element;
};
export function useInputTextWithState(props: InputTextProps, initialValue?: string): UseInputTextWithStateRet {
  const state = useState(initialValue);
  const [value, setValue] = state;
  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    props.onChange?.(e);
  };
  const inputTextProps: InputTextProps = {
    ...props,
    onChange: onChangeHandler,
    value,
  };

  return {
    element: InputText(inputTextProps),
    state,
  };
}