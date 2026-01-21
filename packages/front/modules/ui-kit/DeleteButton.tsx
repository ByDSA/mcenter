import { DeleteForever } from "@mui/icons-material";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";

type Props = Omit<Parameters<typeof DaButton>[0], "children">;
export const DaDeleteButton = (props: Props) => (
  <DaButton
    title="Eliminar"
    theme="red"
    {...props}
  ><DeleteForever /></DaButton>
);
