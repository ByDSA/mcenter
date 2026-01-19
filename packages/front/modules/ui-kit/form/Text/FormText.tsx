import { ReactNode } from "react";
import styles from "./styles.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormText = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.text}>{children}</span>;
};
