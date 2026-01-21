import { useMemo } from "react";
import { DaButton } from "../form/input/Button/Button";
import { DaFooterButtons } from "../form/Footer/Buttons/FooterButtons";
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
  const footer = useMemo(()=><DaFooterButtons>
    <DaButton theme={"white"} onClick={async ()=> {
      await confirmModal.closeModal(true);
    }}>Sí</DaButton>
    <DaButton theme={"white"} onClick={async ()=> {
      await confirmModal.closeModal();
    }}>Cancelar</DaButton>
  </DaFooterButtons>, [confirmModal.closeModal]);
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
         title: props?.title ?? "Confirmar",
         content: props?.content
           ? <>
             {props.content}
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
  };
};
