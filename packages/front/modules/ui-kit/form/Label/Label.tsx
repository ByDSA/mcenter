import { ReactNode } from "react";
import styles from "./styles.module.css";

export const DaLabel = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.label}>{children}</span>;
};
