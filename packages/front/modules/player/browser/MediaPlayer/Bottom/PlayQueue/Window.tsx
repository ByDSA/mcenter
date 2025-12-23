import { KeyboardArrowDown } from "@mui/icons-material";
import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import buttonStyles from "../../OtherButtons.module.css";
import styles from "./Window.module.css";

type Props = {
  close: ()=> void;
  className?: string;
  state: "closed" | "open";
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
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
          <button
            onClick={close}
            className={classes(buttonStyles.controlButton, styles.closeButton)}
          >
            <KeyboardArrowDown />
          </button>
        </footer>
      </div>
    </>
  );
};
