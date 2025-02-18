import { JSX } from "react";
import { InputNumberProps } from "./InputNumber";
import { InputTextProps } from "./InputText";
import { ResourceInputCommonProps } from "./ResourceInputCommonProps";
import { ResourceInputNumber } from "./ResourceInputNumber";
import { ResourceInputText } from "./ResourceInputText";

export type ResourceInputProps<R extends object> = ResourceInputCommonProps<R> & {
  caption?: JSX.Element | string;
  type?: "number" | "string";
  inputTextProps?: InputTextProps;
  inputNumberProps?: InputNumberProps;
};

export function ResourceInput<R extends object>(
  { caption,
    prop, resourceState,
    isOptional = false,
    error,
    type, inputNumberProps,
    inputTextProps }: ResourceInputProps<R>,
) {
  let input: JSX.Element;

  if (type === "number") {
    input = ResourceInputNumber<R>( {
      prop,
      resourceState,
      isOptional,
      inputNumberProps,
      error,
    } );
  } else {
    input = ResourceInputText<R>( {
      prop,
      resourceState,
      isOptional,
      inputTextProps,
      error,
    } );
  }

  if (caption) {
    return <span className="ui-kit-resource-input">
      <span>{caption}</span>
      {input}
    </span>;
  }

  return input;
}
