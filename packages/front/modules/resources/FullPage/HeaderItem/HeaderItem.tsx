import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import commonStyles from "../Header.module.css";
import styles from "./styles.module.css";

type Props = {
  title: ReactNode;
  cover: ReactNode;
  info?: ReactNode;
  controls?: ReactNode;
  className?: string;
};

export const HeaderItem = ( { title,
  cover,
  info,
  controls,
  className }: Props) => {
  return (
    <header className={classes(commonStyles.header, styles.container, className)}>
      <div className={styles.itemMainRow}>
        <div className={classes(commonStyles.coverWrapper, styles.itemCover)}>
          {cover}
        </div>

        <div className={styles.itemDetails}>
          <div className={styles.itemTitleWrapper}>
            <p className={styles.itemTitle}>{title}</p>
          </div>
          {info && <div className={styles.itemInfoColumn}>{info}</div>}
        </div>
      </div>

      {controls && <footer className={styles.itemFooter}>{controls}</footer>}
    </header>
  );
};
