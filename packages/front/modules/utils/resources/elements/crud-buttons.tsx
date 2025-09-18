import { CheckBox, DeleteForever, Undo } from "@mui/icons-material";
import { LinkAsyncAction } from "#modules/ui-kit/input/LinkAsyncAction";
import { classes } from "#modules/utils/styles";
import { Spinner } from "#modules/ui-kit/spinner";
import { CrudOp } from "../useCrud";
import styles from "./crud-buttons.module.css";

type Props = {
  onClick: ()=> Promise<void>;
  disabled?: boolean;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResetResource = ( { onClick, disabled = false }: Props) =>(
  <span className={classes(styles.resetButton, disabled && styles.disabled)}><a title="Deshacer" onClick={() => onClick()}><Undo /></a></span>
);

type UpdateDeleteProps = Omit<Parameters<typeof LinkAsyncAction>[0], "children"> & {
  className?: string;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const UpdateResource = ( { className, action, isDoing,
  spinnerSide, disabled }: UpdateDeleteProps) => (
  <span className={classes(styles.updateButton, disabled && styles.disabled, className)}>{
    <LinkAsyncAction
      action={action as ()=> Promise<any>}
      isDoing={isDoing}
      spinnerSide={spinnerSide ?? "right"}
      title="Actualizar"
      disabled={disabled}
    ><CheckBox /></LinkAsyncAction>
  }</span>
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DeleteResource = ( { className, action,
  disabled, isDoing, spinnerSide }: UpdateDeleteProps) => (
  <span className={classes(styles.deleteButton, disabled && styles.disabled, className)}>{
    <LinkAsyncAction
      title="Eliminar"
      action={action as ()=> Promise<any>}
      isDoing={isDoing}
      spinnerSide={spinnerSide ?? "right"}
      disabled={disabled}
    ><DeleteForever /></LinkAsyncAction>
  }</span>
);

type CreateActionsBarProps = {
  spinnerSide: "left" | "right";
  isModified?: boolean;
  reset?: ()=> Promise<void>;
  update?: CrudOp<unknown>;
  remove?: CrudOp<unknown>;
};
export function createActionsBar( { isModified = false,
  update, remove, reset, spinnerSide }: CreateActionsBarProps) {
  const isDoing = update?.isDoing || remove?.isDoing || false;

  return <span className={classes("line", styles.actionsBar)}>
    {spinnerSide === "left" && isDoing && <Spinner/> }
    {update && isModified && <UpdateResource
      action={async ()=>{
        await update.action();
      }}
      isDoing={isDoing}
      disabled={isDoing}
      spinnerSide="none"
    />}
    {reset && isModified && <ResetResource disabled={isDoing} onClick={reset}/>}
    {remove && <DeleteResource
      action={async ()=>{
        await remove.action();
      }}
      isDoing={isDoing}
      disabled={isDoing}
      spinnerSide="none"
    />}
    {spinnerSide === "right" && isDoing && <Spinner/> }
  </span>;
}
