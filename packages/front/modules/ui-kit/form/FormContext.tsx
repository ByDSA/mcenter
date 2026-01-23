import { createContext, useContext, ReactNode } from "react";

interface FormContextType {
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

type DaFormProviderProps = {
  children: ReactNode;
  isDirty?: boolean;
  isSubmitting: boolean;
  isValid?: boolean;
};

export const DaFormProvider = ( { children,
  isDirty: propIsDirty,
  isValid: propIsValid,
  isSubmitting }: DaFormProviderProps) => {
  const value: FormContextType = {

    isDirty: propIsDirty ?? defaultCtx.isDirty,
    isSubmitting,
    isValid: propIsValid ?? defaultCtx.isValid,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useDaFormContext = (): FormContextType => {
  const context = useContext(FormContext);

  if (!context)
    return defaultCtx;

  return context;
};

const defaultCtx: FormContextType = {
  isDirty: true,
  isSubmitting: false,
  isValid: true,
};
