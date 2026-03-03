import { useState } from "react";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { createFormInputText, FormInputText, useFormInputText } from "./FormInputText";

const useFormInputPassword = (props: Parameters<typeof useFormInputText>[0]) => {
  const inputText = useFormInputText(props);
  const [showPassword, setShowPassword] = useState(false);

  return {
    ...inputText,
    showPassword,
    setShowPassword,
  };
};

type CreateProps = NonNullable<Parameters<typeof createFormInputText>[0]>;
type CreateRet = ReturnType<typeof createFormInputText>;
export const createFormInputPassword = (props: CreateProps): CreateRet => {
  const { value, showPassword, setShowPassword,
    isValid, handleInputChange,
    callValidation, errors } = useFormInputPassword(props);
  const { LL } = useI18nContext();

  return {
    element: FormInputText( {
      icon: <Lock />,
      rightIcon: <span
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </span>,
      placeholder: LL.core.auth.register.password(),
      ...props.elementProps,
      onChange: async (e)=>{
        await handleInputChange(e);
        props.elementProps?.onChange?.(e);
      },
      value,
      type: showPassword ? "text" : "password",
      errors,
    } ),
    isValid,
    value,
    callValidation,
  };
};
