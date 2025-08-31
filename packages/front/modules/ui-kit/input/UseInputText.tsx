import { useEffect, useId, useMemo, useRef, useState } from "react";
import { classes } from "#modules/utils/styles";
import { keyDownHandlerGenerator, UseInputProps, useOnChanges } from "./InputCommon";
import { updateHeight, useFirstTimeVisible } from "./height";
import { defaultValuesMap, ResourceInputType } from "./ResourceInput";

type InputElement = HTMLTextAreaElement;
export type UseInputTextProps = UseInputProps<string> & {
  onPressEnter?: OnPressEnter<string>;
  autofocus?: boolean;
};

type OnPressEnterFn<T> = (value: T | undefined)=> void;
export type OnPressEnter<T> = OnPressEnterFn<T> | "newLine" | "nothing";

export function useInputText(props: UseInputTextProps) {
  const { onPressEnter, defaultValue, disabled = false } = props;
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? defaultValuesMap[ResourceInputType.Text]);
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
      className={classes("ui-kit-input-text", props.nullChecked ? "is-null" : "")}
      disabled={disabled}
      value={value}
      autoFocus={props.autofocus}
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
