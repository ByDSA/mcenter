import { useWindowWidth } from "#modules/player/browser/MediaPlayer/Bottom/useWindowWidth";
import { DaButton } from "../form/input/Button/Button";
import { useModal } from "./ModalContext";

type Props = Omit<Parameters<typeof DaButton>[0], "children"> & {
  showOnSmallWidth?: boolean;
};
export const DaCloseModalButton = (props: Props) => {
  const usingModal = useModal(true);
  const width = useWindowWidth();

  if (width < 500 && !props.showOnSmallWidth)
    return null;

  return <DaButton
    {...props}
    type="button"
    theme="white"
    onClick={()=>usingModal.closeModal()}
  >Cerrar</DaButton>;
};
