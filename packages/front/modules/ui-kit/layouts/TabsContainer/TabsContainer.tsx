import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import { MenuItemData } from "#modules/ui-kit/menus/Sidebar";
import { TabsClient } from "#modules/ui-kit/menus/TabsClient";
import styles from "./TabsContainer.module.css";

type Props = {
  data: MenuItemData[];
  children: ReactNode;
  before?: ReactNode;
  className?: string;
};

export function TabsContainer( { children, data, before, className }: Props) {
  return (
    <div className={classes(styles.container)}>
      {<TabsClient className={classes(styles.tabs, className)} data={data} before={before} />}
      {children}
    </div>
  );
}
