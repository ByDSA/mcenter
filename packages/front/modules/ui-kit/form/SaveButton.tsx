import { DaButton } from "./input/Button/Button";

type Props = Omit<Parameters<typeof DaButton>[0], "children">;
export const DaSaveButton = (props: Props) => {
  return <DaButton
    type="submit"
    {...props}
  >
  Guardar
  </DaButton>;
};
