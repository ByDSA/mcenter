import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./PageContainer.module.css";

export type PageContainerProps = {
  width?: "default" | "full";
};

type Props = {
  props?: PageContainerProps;
  children: ReactNode;
};

export function PageContainer( { children, props }: Props) {
  return (
    <div className={classes(styles.container, props?.width === "full"
      ? styles.full
      : styles.default)}>
      <main>
        {children}
      </main>
    </div>
  );
}
