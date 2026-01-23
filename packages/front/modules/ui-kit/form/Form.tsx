import { FormHTMLAttributes, useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit: typeof propsOnSubmit = async (e) => {
    setIsSubmitting(true);
    await propsOnSubmit?.(e);
    setIsSubmitting(false);
  };

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
