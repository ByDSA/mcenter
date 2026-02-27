import { useEffect, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { Skeleton } from "../Skeleton/Skeleton";
import { BreadcrumbItem, BreadcrumbsView } from "./BreadcrumbsView/Breadcrumbs";
import { resolveBreadcrumbs } from "./orchestator";
import styles from "./BreadcrumbsView/Breadcrumbs.module.css";

interface BreadcrumbsProps {

  /** The current page pathname, e.g. `/episodes/42`. */
  pathname: string;

  /** Optional className forwarded to the <nav> element. */
  className?: string;
}

export function Breadcrumbs( { pathname, className }: BreadcrumbsProps) {
  const [items, setItems] = useState<BreadcrumbItem[] | null>(null);

  useEffect(()=> {
    const fn = async () => {
      const got = await resolveBreadcrumbs(pathname);

      setItems(got);
    };

    fn().catch(showError);
  }, []);

  if (!items)
    return <nav className={styles.nav}><Skeleton width={200}/></nav>;

  return <BreadcrumbsView
    className={className}
    items={items}
  />;
}
