import styles from "./styles.module.css";

type Props = {
  children: React.ReactNode;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormFooterButtons = ( { children }: Props) => {
  return (
    <footer className={styles.footer}>
      {children}
    </footer>
  );
};
