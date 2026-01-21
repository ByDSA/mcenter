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
  const usingModal = useModal();
  let openModal: (
    props?: OpenConfirmModalProps
   )=> Promise<void> = async (props)=> {
     const footer = <DaFooterButtons>
       <DaButton type="submit">Sí</DaButton>
       <DaButton theme={"white"} onClick={async ()=> {
         await doCancel();
         usingModal.closeModal();
       }}>Cancelar</DaButton>
     </DaFooterButtons>;
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
           ? <form onSubmit={async ()=> {
             await doAction();
             usingModal.closeModal();
           }}>
             {props.content}
             {footer}
           </form>
           : undefined,
       } );
     }
   };

  return {
    ...usingModal,
    openModal,
  };
};
