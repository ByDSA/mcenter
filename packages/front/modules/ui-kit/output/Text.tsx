/* eslint-disable @typescript-eslint/naming-convention */
import { JSX } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Text.module.css";

type Props = {
  caption?: JSX.Element | string;
  className?: string;
  value: string;
};
export const OutputText = ( { caption,
  value,
  className }: Props) => {
  const output = <span className={classes(styles.content, className)}>{value}</span>;

  if (caption) {
    return <>
      <span>{caption}</span>
      {output}
    </>;
  }

  return output;
};
