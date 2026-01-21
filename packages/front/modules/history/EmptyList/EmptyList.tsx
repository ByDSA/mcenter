import styles from "./styles.module.css";

type Props = {
  label?: string;
};
export const EmptyList = (props?: Props) => {
  return <section className={styles.container}>{props?.label
    ?? "No hay ningún elemento en esta lista."}</section>;
};
