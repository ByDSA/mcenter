/* eslint-disable daproj/max-len */
import React from "react";
import { useRouter } from "next/navigation";
import { classes } from "#modules/utils/styles";
import { DaAnchor } from "../Anchor/Anchor";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

const DefaultSeparator = () => (
  <svg
    className={styles.separatorIcon}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path d="M5.5 3L10.5 8L5.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Breadcrumbs = ( { items,
  separator,
  maxItems,
  className }: BreadcrumbsProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const router = useRouter();
  const shouldCollapse = maxItems && items.length > maxItems && !expanded;
  const visibleItems = shouldCollapse
    ? [
      items[0],
      null, // ellipsis placeholder
      ...items.slice(items.length - (maxItems - 1)),
    ]
    : items;
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: BreadcrumbItem,
    _index: number,
  ) => {
    if (item.href) {
      e.preventDefault();
      router.push(item.href);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={classes(styles.nav, className)}>
      <ol className={styles.list}>
        {visibleItems.map((item, idx) => {
          if (item === null) {
            return (
              <li key="ellipsis" className={styles.item}>
                <button
                  className={styles.ellipsis}
                  onClick={() => setExpanded(true)}
                  aria-label="Show all breadcrumbs"
                  title="Show all"
                >
                  &hellip;
                </button>
                <span className={styles.separator} aria-hidden="true">
                  {separator ?? <DefaultSeparator />}
                </span>
              </li>
            );
          }

          const isLast = idx === visibleItems.length - 1;

          return (
            <li
              key={`${item.label}-${idx}`}
              className={`${styles.item} ${isLast ? styles.itemCurrent : ""}`}
            >
              {isLast
                ? (
                  <span className={styles.current} aria-current="page">
                    {item.icon && <span className={styles.icon}>{item.icon}</span>}
                    {item.label}
                  </span>
                )
                : (
                  <>
                    <DaAnchor
                      href={item.href ?? "#"}
                      className={styles.link}
                      onClick={(e) => handleClick(e, item, idx)}
                    >
                      {item.icon && <span className={styles.icon}>{item.icon}</span>}
                      {item.label}
                    </DaAnchor>
                    <span className={styles.separator} aria-hidden="true">
                      {separator ?? <DefaultSeparator />}
                    </span>
                  </>
                )}
            </li>
          );
        } )}
      </ol>
    </nav>
  );
};
