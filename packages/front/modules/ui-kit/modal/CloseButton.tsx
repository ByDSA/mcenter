import { ReactNode } from "react";
import { useWindowWidth } from "#modules/player/browser/MediaPlayer/Bottom/useWindowWidth";
import { DaButton } from "../form/input/Button/Button";
import { useModal } from "./ModalContext";

type Props = Omit<Parameters<typeof DaButton>[0], "children"> & {
  showOnSmallWidth?: boolean;
  children?: ReactNode;
};
export const DaCloseModalButton = ( { showOnSmallWidth, children, ...props }: Props) => {
  const usingModal = useModal(true);
  const width = useWindowWidth();

  if (width < 500 && !showOnSmallWidth)
    return null;

  return <DaButton
    {...props}
    type="button"
    theme="white"
    onClick={(e)=>{
      props.onClick?.(e);
      usingModal.closeModal();
    }}
  >
    {children ?? "Cerrar"}
  </DaButton>;
};
