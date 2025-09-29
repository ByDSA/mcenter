import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./FullPage.module.css";

type Props = {
  children: ReactNode;
};

export function FullPageContainer( { children }: Props) {
  return (
    <main className={classes(styles.main)}>
      {children}
    </main>
  );
}
