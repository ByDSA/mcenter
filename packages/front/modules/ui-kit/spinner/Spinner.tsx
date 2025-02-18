import React from "react";
import stylee from "./style.module.css";

type SpinnerProps = object;

// eslint-disable-next-line no-empty-pattern, @typescript-eslint/naming-convention
export const Spinner: React.FC<SpinnerProps> = ( { }: SpinnerProps) => (
  <span className={stylee.spinner}
  ></span>
);
