import { ReactNode } from "react";
import styles from "./FormLabel.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormLabel = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.label}>{children}</span>;
};
