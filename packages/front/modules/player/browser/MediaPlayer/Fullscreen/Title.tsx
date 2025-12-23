import styles from "./FullscreenMediaPlayer.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Title = ( { children }: {children: React.ReactNode} ) => {
  return <h3 className={styles.title}>{children}</h3>;
};
