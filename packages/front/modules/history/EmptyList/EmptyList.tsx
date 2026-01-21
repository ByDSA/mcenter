import { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
  label?: string;
  top?: ReactNode;
};
export const EmptyList = (props?: Props) => {
  return <section className={styles.container}>
    {props?.top}
    <span className={styles.label}>{props?.label
    ?? "No hay ningún elemento en esta lista."}</span>
  </section>;
};

export const EmptyListTopIconWrap = ( { children }: {children: ReactNode} )=> {
  return <span className={styles.topIconWrap}>{children}</span>;
};
