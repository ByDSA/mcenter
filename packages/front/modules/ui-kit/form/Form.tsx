import { FormHTMLAttributes, useEffect, useState } from "react";
import { logger } from "#modules/core/logger";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { useModal } from "../modal/ModalContext";
import { DaFormProvider } from "./FormContext";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  isDirty?: boolean;
  isValid?: boolean;
};

export const DaForm = ( { children,
  onSubmit: propsOnSubmit,
  isDirty,
  isValid,
  ...props }: Props) => {
  const { LL } = useI18nContext();
  const confirmModalOptions = {
    title: LL.uikit.forms.unsavedDataModalTitle(),
    content: (
      <>
        <p>{LL.uikit.forms.unsavedData()}</p>
        <p>{LL.uikit.modals.confirmClose()}</p>
      </>
    ),
  };
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
