import { useCallback, useState } from "react";
import { useModal } from "#modules/ui-kit/modal/ModalContext";

type UseFormModalProps<R> = {
  // Función que hace la llamada a la API (debe devolver los datos)
  onSubmit: ()=> Promise<R>;
  // Validación opcional
  canSubmit?: ()=> boolean;
  // Callback que viene desde fuera (props del componente)
  onSuccess?: (data: R)=> void;
};

export const useFormModal = <R, >( { onSubmit, canSubmit, onSuccess }: UseFormModalProps<R>) => {
  const modal = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = useCallback(async () => {
    if (canSubmit && !canSubmit())
      return;

    if (isSubmitting)
      return;

    try {
      setIsSubmitting(true);

      const result = await onSubmit();

      onSuccess?.(result);
      modal.closeModal();
    } catch (error) {
      console.error("Error en modal form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, canSubmit, onSuccess, modal, isSubmitting]);

  return {
    submit,
    isSubmitting,
    canSubmit: (!canSubmit || canSubmit()) && !isSubmitting,
    ...modal,
  };
};
