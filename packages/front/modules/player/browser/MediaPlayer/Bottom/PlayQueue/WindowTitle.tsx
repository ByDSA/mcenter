import { ReactNode } from "react";
import styles from "./WindowTitle.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WindowTitle = ( { children }: {children: ReactNode} ) => {
  return <h2 className={styles.title}>{children}</h2>;
};
