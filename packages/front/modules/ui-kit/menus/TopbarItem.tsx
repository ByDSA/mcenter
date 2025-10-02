/* eslint-disable @typescript-eslint/naming-convention */
import { classes } from "#modules/utils/styles";
import { MenuItemData } from "./Sidebar";
import styles from "./Topbar.module.css";

export const TopbarItem = ( { path, label, title, active, icon, onClick }: MenuItemData) => {
  return <a
    key={path}
    className={classes(styles.item, active && styles.active)}
    href={path}
    title={title}
    onClick={onClick}
  >
    {icon && <span className={styles.icon}>{icon}</span>}
    {label}
  </a>;
};
