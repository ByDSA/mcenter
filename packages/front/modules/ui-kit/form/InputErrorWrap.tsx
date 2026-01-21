import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./InputErrorWrap.module.css";

export const DaInputErrorWrap = ( { children, inline }: {children: ReactNode;
inline?: boolean;} ) => {
  return <section className={classes(styles.container, inline && styles.inline)}>
    {children}
  </section>;
};
