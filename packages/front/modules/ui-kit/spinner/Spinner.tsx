/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import { classes } from "#modules/utils/styles";
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
  return <span className={classes(stylesFetching.loading, stylesFetching.contentSpinner)}><Spinner size={props?.size ?? 6}/></span>;
};

export const InlineSpinner = (props?: ContentSpinnerProps) => {
  return <span className={classes(stylesFetching.loading, stylesFetching.inlineSpinner)}><Spinner size={props?.size ?? 1}/></span>;
};
