import styles from "./FullscreenMediaPlayer.module.css";

export const Title = ( { children }: {children: React.ReactNode} ) => {
  return <h3 className={styles.title}>{children}</h3>;
};
