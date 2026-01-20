import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>)=> void;
};

export const LoginRegisterForm = ( { title, subtitle, children, className, onSubmit }: Props) => {
  return (
    <form className={classes(styles.box, className)} onSubmit={onSubmit}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      {children}
    </form>
  );
};
