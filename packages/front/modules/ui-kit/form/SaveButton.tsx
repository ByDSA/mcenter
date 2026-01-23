import { ReactNode } from "react";
import { useDaFormContext } from "./FormContext";
import { DaButton } from "./input/Button/Button";

type Props = Omit<Parameters<typeof DaButton>[0], "children"> & {
  children?: ReactNode;
};
export const DaSaveButton = (props: Props) => {
  const formCtx = useDaFormContext();
  const canSave = formCtx.isDirty && formCtx.isValid;

  return <DaButton
    type="submit"
    {...props}
    disabled={props.disabled ?? !canSave}
  >
    {props.children ?? "Guardar"}
  </DaButton>;
};
