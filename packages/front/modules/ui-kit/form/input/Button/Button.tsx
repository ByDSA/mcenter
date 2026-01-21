import { JSX } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  left?: JSX.Element;
  right?: JSX.Element;
  children: React.ReactNode;
  theme?: "blue" | "dark-gray" | "red" | "white";
  isSubmitting?: boolean;
};

export const DaButton = ( { children, left, right,
  isSubmitting = false,
  theme = "dark-gray", disabled, ...buttonProps }: Props) => {
  let content = (<>
    {left && <section className={styles.left}>{left}</section>}
    <section className={styles.childrenSection}>{children}</section>
    {right && <section className={styles.right}>{right}</section>}
  </>
  );

  return <button
    type="button"
    disabled={disabled || isSubmitting}
    {...buttonProps}
    className={classes(
      styles.button,
      theme === "blue" && styles.blue,
      theme === "white" && styles.white,
      theme === "dark-gray" && styles.darkGray,
      theme === "red" && styles.red,
      buttonProps.className,
      isSubmitting && styles.isSubmitting,
    )}
  >
    {content}
  </button>;
};
