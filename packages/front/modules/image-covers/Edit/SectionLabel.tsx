import { ReactNode } from "react";
import styles from "./SectionLabel.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SectionLabel = ( { children }: {children: ReactNode} ) => {
  return <span className={styles.sectionLabel}>{children}</span>;
};
