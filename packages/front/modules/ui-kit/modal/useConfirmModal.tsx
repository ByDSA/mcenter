import { useMemo } from "react";
import { Button } from "../input/Button";
import { useModal } from "./useModal";

type Action = (obj: unknown)=> Promise<boolean> | boolean;

type Props = Parameters<typeof useModal>[0] & {
  action?: Action;
  onActionSuccess?: ()=> Promise<void> | void;
  onCancel?: ()=> Promise<void> | void;
  onFinish?: ()=> Promise<void> | void;
  bypass?: ()=> Promise<boolean> | boolean;
};
export const useConfirmModal = (props: Props) => {
  const onClose = async (obj: unknown) => {
    await props?.onClose?.(null);

    if (obj === true) {
      const ret = await props?.action?.(obj);

      if (ret)
        await props.onActionSuccess?.();
    } else
      await props.onCancel?.();

    await props.onFinish?.();
  };
  const confirmModal = useModal( {
    ...props,
    onClose,
  } );
  let { open } = confirmModal;

  if (props.bypass) {
    open = async ()=> {
      const bypassed = await props.bypass?.();

      if (bypassed)
        await onClose(true);
      else
        confirmModal.open();
    };
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Modal } = confirmModal;
  const confirmModalModal = useMemo(()=>( { children }: {children: React.ReactNode} )=> <Modal>
    {children}
    <footer>
      <Button onClick={async ()=> {
        await confirmModal.close(true);
      }}>Sí</Button>
      <Button onClick={async ()=> {
        await confirmModal.close();
      }}>Cancelar</Button>
    </footer>
  </Modal>, [Modal]);

  return {
    ...confirmModal,
    open,
    Modal: confirmModalModal,
  };
};
