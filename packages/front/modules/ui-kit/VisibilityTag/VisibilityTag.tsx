import { Public, PublicOff } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  isPublic: boolean;
  iconClassName?: string;
  className?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VisibilityTag = ( { isPublic, iconClassName, className }: Props) => {
  const icon = isPublic ? <Public /> : <PublicOff />;

  return <span className={classes(styles.wrap, className)}>
    <span
      className={classes(iconClassName, styles.visibility)}
      title={isPublic ? "Lista pública" : "Lista privada"}
    >{icon}</span>
    <span>{isPublic ? "Pública" : "Privada"}</span>
  </span>;
};
