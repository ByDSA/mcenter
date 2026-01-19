/* eslint-disable @typescript-eslint/naming-convention */
import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Sidebar.module.css";

import "../../../styles/globals.css";

export type MenuItemData = {
  icon?: ReactNode;
  title?: string;
  label: ReactNode;
  path: string;
  matchPath?: {
    startsWith?: string;
    customMatch?: (currentPath: string)=> boolean;
  };
  active?: boolean;
  onClick?: SidebarItemProps["onClick"];
};
interface SidebarProps {
  className?: string;
  data: MenuItemData[];
}

export const Sidebar = ( { data, className }: SidebarProps) => {
  return (
    <nav className={classes(styles.sidebar, styles.nav, className)}>
      {data.map((item) => (
        <a
          key={item.path}
          className={classes(styles.item, item.active && styles.active)}
          href={item.path}
          onClick={item.onClick}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          {item.label}
        </a>
      ))}
    </nav>
  );
};

interface SidebarItemProps {
  icon?: ReactNode;
  children: ReactNode;
  active?: boolean;
  path: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}
