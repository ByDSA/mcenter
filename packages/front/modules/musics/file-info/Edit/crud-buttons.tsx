import { DeleteForever } from "@mui/icons-material";
import { LinkAsyncAction } from "#modules/ui-kit/input/LinkAsyncAction";
import { classes } from "#modules/utils/styles";
import styles from "./crud-buttons.module.css";

type UpdateDeleteProps = Omit<Parameters<typeof LinkAsyncAction>[0], "children"> & {
  className?: string;
};

export const DeleteResource = ( { className, action,
  disabled, isDoing, spinnerSide }: UpdateDeleteProps) => (
  <span className={classes(styles.deleteButton, disabled && styles.disabled, className)}>{
    <LinkAsyncAction
      title="Eliminar"
      action={action}
      isDoing={isDoing}
      spinnerSide={spinnerSide ?? "right"}
      disabled={disabled}
    ><DeleteForever /></LinkAsyncAction>
  }</span>
);
