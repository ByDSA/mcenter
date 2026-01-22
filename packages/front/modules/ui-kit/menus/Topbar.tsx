import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./Topbar.module.css";

type Props = {
  className?: string;
  main: ReactNode;
  rightAside?: ReactNode;
  leftAside?: ReactNode;
};

export const Topbar = ( { main, className, leftAside, rightAside }: Props) =>{
  return (
    <nav className={classes(styles.nav, className)}>
      {leftAside && <aside>{leftAside}</aside>}
      <main>
        {main}
      </main>
      {rightAside && <aside>{rightAside}</aside>}
    </nav>
  );
};
