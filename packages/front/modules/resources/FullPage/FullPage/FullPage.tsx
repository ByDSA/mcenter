import { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
  children: ReactNode;
};
export const ResourceFullPage = ( { children }: Props) => {
  return <section className={styles.container}>
    {children}
  </section>;
};
