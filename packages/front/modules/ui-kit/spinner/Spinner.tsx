/* eslint-disable import/prefer-default-export */
import React from "react";
import stylee from "./style.module.css";

interface SpinnerProps {
  style?: React.CSSProperties;
}

export const Spinner: React.FC<SpinnerProps> = ( { style } ) => (
  <span className={stylee.spinner}
    style={style}
  ></span>
);