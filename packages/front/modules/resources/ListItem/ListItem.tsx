import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./ListItem.module.css";

type ListItemColumnProps = {
  children: ReactNode;
  className?: string;
};
export const ListItemColumn = (props: ListItemColumnProps)=> {
  return <span className={classes(styles.rows, props.className)}>{props.children}</span>;
};

export const ListItemRow = (props: ListItemColumnProps)=> {
  return <span className={classes(styles.columns, props.className)}>{props.children}</span>;
};
