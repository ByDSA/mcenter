import { ReactNode } from "react";
import styles from "./styles.module.css";

export const FormText = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.text}>{children}</span>;
};
