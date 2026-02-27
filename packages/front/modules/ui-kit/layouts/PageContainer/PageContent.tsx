import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { classes } from "#modules/utils/styles";
import { Breadcrumbs } from "#modules/ui-kit/Breadcrumbs/Breadcrumbs";
import styles from "./PageContent.module.css";

type Props = {
  children: ReactNode;
  noBreadcrumbs?: boolean;
};

export function PageContent( { children, noBreadcrumbs = false }: Props) {
  const pathname = usePathname();

  return (
    <main className={classes(styles.content, !noBreadcrumbs && styles.hasBreadcrumbs)}>
      {!noBreadcrumbs && <Breadcrumbs pathname={pathname} />}
      {children}
    </main>
  );
}
