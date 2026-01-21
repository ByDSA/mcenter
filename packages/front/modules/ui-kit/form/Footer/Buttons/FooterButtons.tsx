import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
};
export const DaFooterButtons = ( { className, children }: Props) => {
  return (
    <footer className={classes(styles.footer, className)}>
      {children}
    </footer>
  );
};
