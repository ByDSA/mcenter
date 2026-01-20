import styles from "./ItemNotFound.module.css";

export const ItemNotFound = () => <section className={styles.main}>
  <p>😨 Ups... 😨</p>
  <p>Elemento no encontrado.</p>
</section>;

export const PageItemNotFound = () => <section className={styles.page}>
  <ItemNotFound />
</section>;
