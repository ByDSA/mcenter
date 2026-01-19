import { classes } from "#modules/utils/styles";
import styles from "./Separator.module.css";

type Props = {
  className?: string;
  collapsable?: boolean;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Separator = (props?: Props) =><span
  className={classes(
    styles.separator,
    !(props?.collapsable ?? true) && styles.nonCollapsable,
    props?.className,
  )}
>•</span>;
