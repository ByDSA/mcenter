import { classes } from "#modules/utils/styles";
import styles from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Button = ( { children, ...buttonProps }: Props) => {
  return <button
    type="button"
    {...buttonProps}
    className={classes(styles.button, buttonProps.className)}
  >
    {children}
  </button>;
};
