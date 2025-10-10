/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import stylesFetching from "./fetching.style.module.css";
import styles from "./style.module.css";

type SpinnerProps = object;

// eslint-disable-next-line no-empty-pattern
export const Spinner: React.FC<SpinnerProps> = ( { }: SpinnerProps) => (
  <span className={styles.spinner}
  ></span>
);

export const PageSpinner = () => {
  return <div className={stylesFetching.loading}><Spinner/></div>;
};
