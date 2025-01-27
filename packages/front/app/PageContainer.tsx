import styles from "./PageContainer.module.css";

export function PageContainer( { children } ) {
  return (
    <div className={styles.container}>
      <main>
        {children}
      </main>
    </div>
  );
}
