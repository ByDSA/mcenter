"use client";

import { classes } from "#modules/utils/styles";
import { PlayerWindowView } from "../Bottom/PlayQueue/Window";
import windowStyles from "../Bottom/PlayQueue/Window.module.css";
import styles from "./FullscreenView.module.css";

type Props = Parameters<typeof PlayerWindowView>[0];
export function PlayerFullscreenView( { children, state }: Props) {
  return <div
    className={classes(styles.container, state === "closed" && windowStyles.closed)}
    onClick={(e)=>e.stopPropagation()}
  >
    {children}
  </div>;
}
