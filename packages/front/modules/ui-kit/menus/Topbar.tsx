/* eslint-disable @typescript-eslint/naming-convention */
import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Topbar.module.css";
import { MenuItemData } from "./Sidebar";
import { TopbarMainClient } from "./TopbarClient";

type Props = {
  className?: string;
  mainData: MenuItemData[];
  rightAside?: ReactNode;
  leftAside?: ReactNode;
};

export const Topbar = ( { mainData, className, leftAside, rightAside }: Props) =>{
  return (
    <nav className={classes(styles.nav, className)}>
      {leftAside && <aside>{leftAside}</aside>}
      <main>
        <TopbarMainClient data={mainData} />
      </main>
      {rightAside && <aside>{rightAside}</aside>}
    </nav>
  );
};
