import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./List.module.css";

type Props = {
  children: ReactNode;
};

export const ResourceList = (props: Props) => {
  return <section className={classes(styles.list)}>{props.children}</section>;
};
