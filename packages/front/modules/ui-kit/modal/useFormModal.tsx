import { useCallback, useState } from "react";

type UseFormModalProps<R> = {
  // Función que hace la llamada a la API (debe devolver los datos)
  onSubmit: ()=> Promise<R> | R;
  canSubmit?: ()=> boolean;
  onSuccess?: (data: R)=> void;
};

export const useFormInModal = <R, >( { onSubmit, canSubmit, onSuccess }: UseFormModalProps<R>) => {
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
    } catch (error) {
      console.error("Error en modal form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, canSubmit, onSuccess, isSubmitting]);

  return {
    submit,
    isSubmitting,
    canSubmit: (!canSubmit || canSubmit()) && !isSubmitting,
  };
};
