import { FormHTMLAttributes, useEffect, useState } from "react";
import { logger } from "#modules/core/logger";
import { useModal } from "../modal/ModalContext";
import { DaFormProvider } from "./FormContext";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  isDirty?: boolean;
  isValid?: boolean;
};

const confirmModalOptions = {
  title: "Datos sin guardar",
  content: (
    <>
      <p>Hay datos sin guardar.</p>
      <p>¿Seguro que quieres cerrar?</p>
    </>
  ),
};

export const DaForm = ( { children,
  onSubmit: propsOnSubmit,
  isDirty,
  isValid,
  ...props }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usingModal = useModal(true);
  const onSubmit: typeof propsOnSubmit = async (e) => {
    e.preventDefault(); // Para no recargar la página
    setIsSubmitting(true);
    usingModal.setConfirmClose(null);
    try {
      await propsOnSubmit?.(e);
    } catch (err) {
      if (err instanceof Error)
        logger.error(err.message);

      if (isDirty)
        usingModal.setConfirmClose(confirmModalOptions);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(()=> {
    if (isDirty && !isSubmitting)
      usingModal.setConfirmClose(confirmModalOptions);
    else
      usingModal.setConfirmClose(null);
  }, [isDirty]);

  return <DaFormProvider
    isSubmitting={isSubmitting}
    isValid={isValid}
    isDirty={isDirty}
  >
    <form
      onSubmit={onSubmit}
      {...props}>
      {children}
    </form>
  </DaFormProvider>;
};
