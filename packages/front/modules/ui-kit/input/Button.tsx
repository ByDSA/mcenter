import { classes } from "#modules/utils/styles";
import styles from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  mode?: "dark" | "light";
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Button = ( { children, mode, ...buttonProps }: Props) => {
  return <button
    type="button"
    {...buttonProps}
    className={classes(
      styles.button,
      mode === "light" && styles.light,
      buttonProps.className,
    )}
  >
    {children}
  </button>;
};
