import { useState } from "react";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
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

  return {
    element: FormInputText( {
      icon: <Lock />,
      rightIcon: <span
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </span>,
      placeholder: "Contraseña",
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
