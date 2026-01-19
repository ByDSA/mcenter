import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormFooterButtons = ( { className, children }: Props) => {
  return (
    <footer className={classes(styles.footer, className)}>
      {children}
    </footer>
  );
};
