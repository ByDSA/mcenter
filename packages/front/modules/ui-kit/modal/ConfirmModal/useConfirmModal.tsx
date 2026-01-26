import { OpenModalProps, useModal } from "../ModalContext";
import { ConfirmModalContent } from "./Content";

type Action = (obj?: unknown)=> Promise<boolean> | boolean;

export type OpenConfirmModalProps = OpenModalProps & {
  action?: Action;
  onActionSuccess?: ()=> Promise<void> | void;
  onCancel?: ()=> Promise<void> | void;
  onFinish?: ()=> Promise<void> | void;
  bypass?: ()=> Promise<boolean> | boolean;
};

export const useConfirmModal = () => {
  const usingModal = useModal();
  let openModal: (
    props?: OpenConfirmModalProps
   )=> Promise<void> = async (props)=> {
     const bypassed = await props?.bypass?.();
     const doAction = async () => {
       const ret = await props?.action?.();

       if (ret)
         await props?.onActionSuccess?.();

       await props?.onFinish?.();
     };
     const doCancel = async () => {
       await props?.onCancel?.();

       await props?.onFinish?.();
     };

     if (bypassed)
       await doAction();
     else {
       await usingModal.openModal( {
         ...props,
         title: props?.title ?? "Confirmar acción",
         content: props?.content
           ? (
             <ConfirmModalContent
               onConfirm={async () => {
                 await doAction();
                 usingModal.closeModal();
               }}
               onCancel={async () => {
                 await doCancel();
               }}
             >
               {props.content}
             </ConfirmModalContent>
           )
           : undefined,
       } );
     }
   };

  return {
    ...usingModal,
    openModal,
  };
};
