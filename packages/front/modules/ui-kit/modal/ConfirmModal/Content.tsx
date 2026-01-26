import { ReactNode } from "react";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { DaForm } from "#modules/ui-kit/form/Form";
import { DaSaveButton } from "#modules/ui-kit/form/SaveButton";
import { DaCloseModalButton } from "../CloseButton";

export const ConfirmModalContent = ( { children,
  onConfirm,
  onCancel }: {
  children: ReactNode;
  onConfirm: ()=> Promise<void> | void;
  onCancel?: ()=> Promise<void> | void;
} ) => {
  return (
    <DaForm onSubmit={onConfirm}>
      {children}
      <DaFooterButtons>
        <DaSaveButton>Sí</DaSaveButton>
        <DaCloseModalButton onClick={onCancel} showOnSmallWidth>
          Cancelar
        </DaCloseModalButton>
      </DaFooterButtons>
    </DaForm>
  );
};
