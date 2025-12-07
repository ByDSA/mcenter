/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import stylesFetching from "./fetching.style.module.css";
import styles from "./style.module.css";

type SpinnerProps = {
  size?: number;
};

export const Spinner: React.FC<SpinnerProps> = ( { size }: SpinnerProps) => {
  const style = {} as React.CSSProperties;

  if (size !== undefined) {
    if (size < 2) {
      style["--spinner-size"] = size + "rem";
      style["--spinner-width"] = "2px";
    } else {
      style["--spinner-size"] = size + "rem";
      style["--spinner-width"] = `${size}px`;
    }
  }

  return <span className={styles.spinner}
    style={style}
  ></span>;
};

type ContentSpinnerProps = {
  size?: number;
};
export const ContentSpinner = (props?: ContentSpinnerProps) => {
  return <div className={stylesFetching.loading}><Spinner size={props?.size ?? 6}/></div>;
};
