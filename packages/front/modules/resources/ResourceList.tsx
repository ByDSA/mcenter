import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./List.module.css";

type Props = {
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResourceList = (props: Props) => {
  return <span className={classes(styles.list)}>{props.children}</span>;
};
