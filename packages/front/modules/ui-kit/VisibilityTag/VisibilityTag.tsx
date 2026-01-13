import { Public, PublicOff } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type Props = {
  isPublic: boolean;
  className?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VisibilityTag = ( { isPublic, className }: Props) => {
  const icon = isPublic ? <Public /> : <PublicOff />;

  return <span className={styles.wrap}>
    <span
      className={classes(className, styles.visibility)}
      title={isPublic ? "Lista pública" : "Lista privada"}
    >{icon}</span>
    <span>{isPublic ? "Pública" : "Privada"}</span>
  </span>;
};
