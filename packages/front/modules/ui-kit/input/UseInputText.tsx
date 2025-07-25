import { useEffect, useId, useMemo, useRef, useState } from "react";
import { keyDownHandlerGenerator, UseInputProps, useOnChanges } from "./InputCommon";
import { updateHeight, useFirstTimeVisible } from "./height";

type InputElement = HTMLTextAreaElement;
export type UseInputTextProps = UseInputProps<string> & {
  onPressEnter?: OnPressEnter<string>;
  onEmptyPressEnter?: ()=> void;
};

type OnPressEnterFn<T> = (value: T | undefined)=> void;
export type OnPressEnter<T> = OnPressEnterFn<T> | "newLine" | "nothing";

export function useInputText(props: UseInputTextProps) {
  const { onPressEnter, defaultValue, disabled = false } = props;
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateH = useMemo(() => () => textareaRef?.current && updateHeight( {
    value: textareaRef.current.value,
    element: textareaRef.current,
  } ), [textareaRef]);

  useEffect(() => {
    updateH();
  }, [updateH, value]);

  useFirstTimeVisible(textareaRef, () => {
    updateH();
  } );

  const keyDownHandler = useMemo(
    () => keyDownHandlerGenerator<string, InputElement>( {
      onPressEnter,
      value,
    } ),
    [onPressEnter, value],
  );
  const { addOnChange, handleChange } = useOnChanges<string, InputElement>( {
    inputToValue: (t)=>t.value,
    setValue,
    value,
  } );
  const element = (
    <textarea
      ref={textareaRef}
      id={id}
      className="ui-kit-input-text"
      disabled={disabled}
      value={value}
      onChange={handleChange}
      onKeyDown={keyDownHandler}
      style={{
        resize: "none",
        overflow: "hidden",
      }}
    />
  );

  return {
    element,
    value,
    setValue,
    addOnChange,
  };
}
