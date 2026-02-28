import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./PageContent.module.css";
import { PageContentBreadcrumbs } from "./PageContentBreadcrumbs";

type Props = {
  children: ReactNode;
  noBreadcrumbs?: boolean;
};

export function PageContent( { children, noBreadcrumbs = false }: Props) {
  return (
    <main className={classes(styles.content, !noBreadcrumbs && styles.hasBreadcrumbs)}>
      {!noBreadcrumbs && <PageContentBreadcrumbs />}
      {children}
    </main>
  );
}
