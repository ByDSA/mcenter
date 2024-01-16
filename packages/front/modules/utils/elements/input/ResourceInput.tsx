import { JSX, ReactNode } from "react";
import ResourceInputNumber from "./ResourceInputNumber";
import ResourceInputText from "./ResourceInputText";
import { InputResourceProps } from "./props";

function MarginWidth( {children}: {children: ReactNode} ) {
  return <span style={{
    margin: "0 1em",
    width: "100%",
  }}>{children}</span>;
}

export type ResourceInputProps<T extends Object> = InputResourceProps<T> & {
  caption?: JSX.Element | string;
  width?: "100%" | "auto";
  type?: "number" | "string";
};

export default function ResourceInput<T extends Object>( {width, caption, prop, resourceState, isOptional = false, error, type}: ResourceInputProps<T>) {
  let input: JSX.Element;

  if (type === "number") {
    input = ResourceInputNumber( {
      prop,
      resourceState,
      isOptional,
      error,
    } );
  } else {
    input = ResourceInputText( {
      prop,
      resourceState,
      isOptional,
      error,
    } );
  }

  if (caption) {
    return <span style={{
      alignItems: "center",
      width: width ?? "100%",
    }}>
      <span>{caption}</span>
      <MarginWidth>
        {input}
      </MarginWidth>
    </span>;
  }

  return <MarginWidth>
    {input}
  </MarginWidth>;
}