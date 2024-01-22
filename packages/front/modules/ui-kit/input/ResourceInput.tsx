import { JSX } from "react";
import ResourceInputNumber from "./ResourceInputNumber";
import ResourceInputText from "./ResourceInputText";
import { InputResourceProps } from "./props";

export type ResourceInputProps<T extends Object> = InputResourceProps<T> & {
  caption?: JSX.Element | string;
  style?: React.CSSProperties;
  type?: "number" | "string";
};

export default function ResourceInput<T extends Object>( {caption, prop, resourceState, isOptional = false, error, type, inputTextProps}: ResourceInputProps<T>) {
  let input: JSX.Element;

  if (type === "number") {
    input = ResourceInputNumber( {
      prop,
      resourceState,
      isOptional,
      inputTextProps,
      error,
    } );
  } else {
    input = ResourceInputText( {
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