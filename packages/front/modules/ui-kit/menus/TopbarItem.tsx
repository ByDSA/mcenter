import { classes } from "#modules/utils/styles";
import { DaAnchor } from "../Anchor/Anchor";
import { MenuItemData } from "./Sidebar";
import styles from "./Topbar.module.css";

export const TopbarItem = ( { path, label, title, active, icon, onClick }: MenuItemData) => {
  return <DaAnchor
    theme="white"
    key={path}
    className={classes(styles.item, active && styles.active)}
    href={path}
    title={title}
    onClick={onClick}
  >
    {icon && <span className={styles.icon}>{icon}</span>}
    {label}
  </DaAnchor>;
};
