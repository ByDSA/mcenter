import { ReactNode, useCallback, useRef } from "react";
import { Mutex } from "async-mutex";
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
  const mutexRef = useRef(new Mutex());
  const calledActionRef = useRef(false);
  const doMutextAction = useCallback(async () => {
    const release = await mutexRef.current.acquire();

    if (calledActionRef.current)
      return;

    calledActionRef.current = true;

    await props.action();
    release();
  }, [props.action]);

  return {
    action: async ()=> {
      if (navigator.userActivation.hasBeenActive)
        await doMutextAction();
      else {
        await modal.openModal( {
          showBox: false,
          content: <>
            <DaButton
              className={styles.button}
              theme="blue"
              {...props.button?.props}
              onClick={async ()=> {
                await doMutextAction();
                modal.closeModal();
              }}>{props.button?.content ?? <><p>Click para</p><p>Reproducir música</p></>}</DaButton>
          </>,
          ...props.openModalProps,
          onClose: async ()=> {
            await props.openModalProps?.onClose?.();
            await doMutextAction();
          },
        } );
      }
    },
  };
};
