import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./FormInputErrorWrap.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormInputErrorWrap = ( { children, inline }: {children: ReactNode;
inline?: boolean;} ) => {
  return <section className={classes(styles.container, inline && styles.inline)}>
    {children}
  </section>;
};
