import { ReactNode } from "react";
import styles from "./FormLabel.module.css";

export const FormLabel = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.label}>{children}</span>;
};
