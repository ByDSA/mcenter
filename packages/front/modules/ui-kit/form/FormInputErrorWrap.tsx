import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./FormInputErrorWrap.module.css";

export const FormInputErrorWrap = ( { children, inline }: {children: ReactNode;
inline?: boolean;} ) => {
  return <section className={classes(styles.container, inline && styles.inline)}>
    {children}
  </section>;
};
