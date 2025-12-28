import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Tabs.module.css";
import { MenuItemData } from "./Sidebar";

type Props = {
  className?: string;
  data: MenuItemData[];
  before?: ReactNode;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Tabs = ( { data, className, before }: Props) =>{
  return (
    <nav className={classes(styles.tabs, className)}>
      <header>
        {before}
      </header>
      <main>
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
      </main>
    </nav>
  );
};
