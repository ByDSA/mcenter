import { HTMLAttributes } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./FormInputGroup.module.css";

type Props = HTMLAttributes<HTMLElement> & {
  inline?: boolean;
};

export const FormInputGroup = ( { children, inline, className, ...otherProps }: Props) => {
  return <section
    className={classes(
      styles.group,
      inline && styles.inline,
      className,
    )}
    {...otherProps}
  >
    {children}
  </section>;
};

export const FormInputGroupItem = ( { children, inline, className, ...otherProps }: Props) => {
  return <article
    className={classes(
      styles.item,
      inline && styles.inline,
      className,
    )}
    {...otherProps}
  >
    {children}
  </article>;
};
