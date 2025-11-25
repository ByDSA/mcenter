import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type HeaderProps = {
  left?: ReactNode;
  title: string;
  subtitle: ReactNode;
  right?: ReactNode;
};
export function Header( { left, title, subtitle, right }: HeaderProps) {
  return <span className={styles.container}>
    {left && <aside>{left}</aside>}
    <main className={classes("center", "ellipsis")}>
      <span className="ellipsis">{title}</span>
      <span className="ellipsis">{subtitle}</span>
    </main>
    { right && <aside>{right}</aside> }
  </span>;
}
