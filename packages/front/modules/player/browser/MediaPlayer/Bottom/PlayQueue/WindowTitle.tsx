import { ReactNode } from "react";
import styles from "./WindowTitle.module.css";

export const WindowTitle = ( { children }: {children: ReactNode} ) => {
  return <h2 className={styles.title}>{children}</h2>;
};
