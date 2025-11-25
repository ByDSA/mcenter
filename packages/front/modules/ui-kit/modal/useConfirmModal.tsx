import { useMemo } from "react";
import { Button } from "../input/Button";
import { OpenModalProps, useModal } from "./ModalContext";

type Action = (obj?: unknown)=> Promise<boolean> | boolean;

export type OpenConfirmModalProps = OpenModalProps & {
  action?: Action;
  onActionSuccess?: ()=> Promise<void> | void;
  onCancel?: ()=> Promise<void> | void;
  onFinish?: ()=> Promise<void> | void;
  bypass?: ()=> Promise<boolean> | boolean;
};

export const useConfirmModal = () => {
  const confirmModal = useModal();
  const footer = useMemo(()=><footer>
    <Button theme={"white"} onClick={async ()=> {
      await confirmModal.closeModal(true);
    }}>Sí</Button>
    <Button theme={"white"} onClick={async ()=> {
      await confirmModal.closeModal();
    }}>Cancelar</Button>
  </footer>, [confirmModal.closeModal]);
  let openModal: (
    props?: OpenConfirmModalProps
   )=> Promise<void> = async (props)=> {
     const bypassed = await props?.bypass?.();
     const onClose = async (obj: unknown) => {
       await props?.onClose?.(null);

       if (obj === true) {
         const ret = await props?.action?.(obj);

         if (ret)
           await props?.onActionSuccess?.();
       } else
         await props?.onCancel?.();

       await props?.onFinish?.();
     };

     if (bypassed)
       await onClose(true);
     else {
       await confirmModal.openModal( {
         ...props,
         staticContent: props?.staticContent
           ? <>
             {props.staticContent}
             {footer}
           </>
           : undefined,
         onClose,
       } );
     }
   };

  return {
    ...confirmModal,
    openModal,
    setModalContent: (el)=>confirmModal.setModalContent(
      <>
        {el}
        {footer}
      </>,
    ),
  };
};
