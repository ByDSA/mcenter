import { DaFooterButtons } from "../form/Footer/Buttons/FooterButtons";
import { DaForm } from "../form/Form";
import { DaSaveButton } from "../form/SaveButton";
import { OpenModalProps, useModal } from "./ModalContext";
import { DaCloseModalButton } from "./CloseButton";

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
           ? <DaForm onSubmit={async ()=> {
             await doAction();
             usingModal.closeModal();
           }}>
             {props.content}
             <DaFooterButtons>
               <DaSaveButton>Sí</DaSaveButton>
               <DaCloseModalButton
                 onClick={async ()=> {
                   await doCancel();
                 }}
                 showOnSmallWidth
               >Cancelar</DaCloseModalButton>
             </DaFooterButtons>
           </DaForm>
           : undefined,
       } );
     }
   };

  return {
    ...usingModal,
    openModal,
  };
};
