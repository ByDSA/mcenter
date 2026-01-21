import { ReactNode } from "react";
import styles from "./styles.module.css";

export const DaText = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.text}>{children}</span>;
};
