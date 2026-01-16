import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import { classes } from "#modules/utils/styles";
import { keyDownHandlerGenerator, OnChange, UseInputProps, useOnChanges } from "./InputCommon";
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
  const [currentValue, setCurrentValue] = useState(defaultValue ?? "");
  const id = useId();
  const domRef = useRef<HTMLTextAreaElement>(null);
  const elementRef = useRef<InputTextLineRef>(null);
  const keyDownHandler = useMemo(
    () => keyDownHandlerGenerator<string, InputElement>( {
      onPressEnter,
      value: elementRef.current?.getValue() ?? currentValue,
    } ),
    [onPressEnter, elementRef.current],
  );
  const element = useMemo(()=><InputTextLine
    ref={elementRef}
    domRef={domRef}
    id={id}
    className={classes(props.nullChecked && "is-null")}
    defaultValue={defaultValue}
    disabled={disabled}
    autoFocus={props.autofocus}
    onKeyDown={keyDownHandler}
    style={{
      resize: "none",
      overflow: "hidden",
    }}
  />, [id, props.nullChecked, defaultValue, disabled, keyDownHandler, props.autofocus]);
  const updateH = useMemo(() => () => domRef?.current && updateHeight( {
    element: domRef.current!,
  } ), [domRef.current]);

  useEffect(() => {
    elementRef.current?.addOnChange((newValue) => {
      setCurrentValue(newValue);
      updateH();
    } );
  }, [elementRef.current]);

  useFirstTimeVisible(domRef, () => {
    updateH();
  } );

  return {
    element,
    ref: domRef,
    value: currentValue,
    setValue: elementRef.current?.setValue ?? (()=>{
      throw new Error("InputTextLine ref not assigned yet");
    } ),
    addOnChange: elementRef.current?.addOnChange ?? (()=>{
      throw new Error("InputTextLine ref not assigned yet");
    } ),
  };
}

type InputTextProps =
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
    defaultValue?: string;
    onChange?: OnChange<string>;
    domRef?: React.RefObject<HTMLTextAreaElement | null>;
};
type InputTextLineRef = {
  setValue: (value: string)=> void;
  getValue: ()=> string;
  addOnChange: (fn: OnChange<string>)=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const InputTextLine = forwardRef<InputTextLineRef, InputTextProps>(
  (props, ref) => {
    const { defaultValue, onChange, className, style, domRef, ...textAreaProps } = props;
    const internalDomRef = useRef<HTMLTextAreaElement>(null);
    const resolvedDomRef = domRef || internalDomRef;
    const [value, setValue] = useState(defaultValue ?? defaultValuesMap[ResourceInputType.Text]);
    const { addOnChange, handleChange } = useOnChanges<string, InputElement>( {
      inputToValue: (t)=>t.value,
      setValue,
      value,
    } );

    useImperativeHandle(ref, () => ( {
      setValue,
      getValue: () => value,
      addOnChange,
    } ));

    return <InputTextLineView
      ref={resolvedDomRef}
      className={classes("ui-kit-input-text", className)}
      value={value}
      onChange={handleChange}
      {...textAreaProps}
      style={{
        resize: "none",
        overflow: "hidden",
        ...style,
      }}
    />;
  },
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const InputTextLineView = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(
  (props, ref) => {
    const { className, ...textAreaProps } = props;

    return <textarea
      ref={ref}
      className={classes("ui-kit-input-text", className)}
      {...textAreaProps}
      style={{
        resize: "none",
        overflow: "hidden",
        ...props.style,
      }}
    />;
  },
);
