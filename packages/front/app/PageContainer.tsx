import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./PageContainer.module.css";

type Props = {
  className?: string;
  children: ReactNode;
};

export function PageContainer( { children, className }: Props) {
  return (
    <div className={classes(styles.container, className)}>
      <main>
        {children}
      </main>
    </div>
  );
}
