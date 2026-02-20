import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import { DaAnchor } from "../Anchor/Anchor";
import styles from "./Tabs.module.css";
import { MenuItemData } from "./Sidebar";

type Props = {
  className?: string;
  data: MenuItemData[];
  before?: ReactNode;
};
export const Tabs = ( { data, className, before }: Props) =>{
  return (
    <nav className={classes(styles.tabs, className)}>
      <header>
        {before}
      </header>
      <main>
        {data.map((item) => (
          <DaAnchor
            theme="white"
            key={item.path}
            className={classes(styles.item, item.active && styles.active)}
            href={item.path}
            onClick={item.onClick}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            {item.label}
          </DaAnchor>
        ))}
      </main>
    </nav>
  );
};
