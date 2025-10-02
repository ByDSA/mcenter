import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import { MenuItemData } from "#modules/ui-kit/menus/Sidebar";
import { TabsClient } from "#modules/ui-kit/menus/TabsClient";
import styles from "./TabsContainer.module.css";

type Props = {
  data: MenuItemData[];
  children: ReactNode;
};

export function TabsContainer( { children, data }: Props) {
  return (
    <div className={classes(styles.container)}>
      {<TabsClient className={styles.tabs} data={data} />}
      {children}
    </div>
  );
}
