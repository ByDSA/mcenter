/* eslint-disable @typescript-eslint/naming-convention */
import { JSX } from "react";
import styles from "./Text.module.css";

type Props = {
  caption?: JSX.Element | string;
  value: string;
};
export const OutputText = ( { caption,
  value }: Props) => {
  const output = <span className={styles.content}>{value}</span>;

  if (caption) {
    return <>
      <span>{caption}</span>
      {output}
    </>;
  }

  return output;
};
