import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./ListEntry.module.css";

type ListEntryColumnProps = {
  children: ReactNode;
  className?: string;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ListEntryColumn = (props: ListEntryColumnProps)=> {
  return <span className={classes(styles.rows, props.className)}>{props.children}</span>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ListEntryRow = (props: ListEntryColumnProps)=> {
  return <span className={classes(styles.columns, props.className)}>{props.children}</span>;
};
