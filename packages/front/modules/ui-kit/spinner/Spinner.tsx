/* eslint-disable import/prefer-default-export */
import React from "react";
import stylee from "./style.module.css";

type SpinnerProps = {
};

// eslint-disable-next-line no-empty-pattern
export const Spinner: React.FC<SpinnerProps> = ( { }: SpinnerProps) => (
  <span className={stylee.spinner}
  ></span>
);