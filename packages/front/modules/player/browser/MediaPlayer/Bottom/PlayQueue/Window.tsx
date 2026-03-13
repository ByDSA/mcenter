import { KeyboardArrowDown } from "@mui/icons-material";
import { ReactNode } from "react";
import styles from "./Window.module.css";
import { classes } from "#modules/utils/styles";
import { ControlButtonView } from "#modules/player/common/ControlButtonsView";

type Props = {
  close: ()=> void;
  className?: string;
  state: "closed" | "open";
  children: ReactNode;
};

export const PlayerWindowView = ( { close, className, state, children }: Props) => {
  return (
    <>
      <div
        className={classes(styles.backdrop, state === "closed" && styles.closed)}
        onClick={close}
      />
      <div
        onClick={e=>e.stopPropagation()}
        className={classes(
          styles.container,
          state === "closed" && styles.closed,
          className,
        )}>
        <main>
          {children}
        </main>

        <footer>
          <ControlButtonView
            onClick={close}
            className={classes(styles.closeButton)}
          >
            <KeyboardArrowDown />
          </ControlButtonView>
        </footer>
      </div>
    </>
  );
};
