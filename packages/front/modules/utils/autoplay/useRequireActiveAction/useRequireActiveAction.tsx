import { ReactNode } from "react";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import styles from "./styles.module.css";

type Props = {
  action: ()=> Promise<void> | void;
  openModalProps?: OpenModalProps;
  button?: {
    content?: ReactNode;
    props?: Omit<Parameters<typeof DaButton>[0], "children">;
  };
};
export const useRequireActiveAction = (props: Props) => {
  const modal = useModal();

  return {
    action: async ()=> {
      if (navigator.userActivation.hasBeenActive)
        await props.action();
      else {
        await modal.openModal( {
          showBox: false,
          content: <>
            <DaButton
              className={styles.button}
              theme="blue"
              {...props.button?.props}
              onClick={async ()=> {
                await props.action();
                modal.closeModal();
              }}>{props.button?.content ?? <><p>Click para</p><p>Reproducir música</p></>}</DaButton>
          </>,
          ...props.openModalProps,
          onClose: async ()=> {
            await props.openModalProps?.onClose?.();
            await props.action();
          },
        } );
      }
    },
  };
};
