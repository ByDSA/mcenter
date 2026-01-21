import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import styles from "./styles.module.css";

type Props = {
  action: ()=> Promise<void> | void;
  onFinally?: ()=> Promise<void> | void;
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
          onClose: async ()=> {
            await props.action();
            await props.onFinally?.();
          },
          content: <>
            <DaButton
              className={styles.button}
              theme="blue"
              onClick={async ()=> {
                await props.action;
                modal.closeModal();
              }}><p>Click para</p><p>Reproducir música</p></DaButton>
          </>,
        } );
      }
    },
  };
};
