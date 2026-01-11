import { JSX } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  left?: JSX.Element;
  right?: JSX.Element;
  children: React.ReactNode;
  theme?: "blue" | "dark-gray" | "red" | "white";
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Button = ( { children, left, right, theme = "dark-gray", ...buttonProps }: Props) => {
  let content = (<>
    {left && <section className={styles.left}>{left}</section>}
    <section className={styles.childrenSection}>{children}</section>
    {right && <section className={styles.right}>{right}</section>}
  </>
  );

  return <button
    type="button"
    {...buttonProps}
    className={classes(
      styles.button,
      theme === "blue" && styles.blue,
      theme === "white" && styles.white,
      theme === "dark-gray" && styles.darkGray,
      theme === "red" && styles.red,
      buttonProps.className,
    )}
  >
    {content}
  </button>;
};
