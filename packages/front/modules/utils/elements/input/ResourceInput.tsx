import { JSX } from "react";
import ResourceInputNumber from "./ResourceInputNumber";
import ResourceInputText from "./ResourceInputText";
import { InputResourceProps } from "./props";

export type ResourceInputProps<T extends Object> = InputResourceProps<T> & {
  caption?: JSX.Element | string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  type?: "number" | "string";
};

export default function ResourceInput<T extends Object>( {style, inputStyle, caption, prop, resourceState, isOptional = false, error, type}: ResourceInputProps<T>) {
  let input: JSX.Element;
  const actualInputStyle = {
    ...defaultStyle,
    ...inputStyle,
  };

  if (type === "number") {
    input = ResourceInputNumber( {
      prop,
      resourceState,
      isOptional,
      style: actualInputStyle,
      error,
    } );
  } else {
    input = ResourceInputText( {
      prop,
      resourceState,
      isOptional,
      style: actualInputStyle,
      error,
    } );
  }

  if (caption) {
    return <span style={{
      alignItems: "center",
      width: style?.width ?? "100%",
      ...style,
    }}>
      <span>{caption}</span>
      {input}
    </span>;
  }

  return input;
}

const defaultStyle: React.CSSProperties = {
  margin: "0 1em",
  width: "100%",
};