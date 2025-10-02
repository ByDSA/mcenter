import { ReactNode, JSX, useState, useCallback, useEffect, useRef } from "react";
import { Title } from "@mui/icons-material";
import { showError } from "$shared/utils/errors/showError";
import { classes } from "#modules/utils/styles";
import styles from "./styles.module.css";

type CallValidationFnProps = {
  updateErrors: boolean;
  ctx?: object;
};
export type CallValidationFn = (props: CallValidationFnProps)=> Promise<void>;

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  errors?: string[] | null;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FormInputText = ( { icon, rightIcon, errors, className, ...props }: Props) => {
  return <div>
    <div className={classes(styles.inputWrapper)}>
      {icon && <span className={classes(styles.icon, styles.iconLeft)}>
        {icon}
      </span>
      }
      <input
        className={classes(
          styles.input,
          (errors?.length ?? 0) > 0 && styles.error,
          className,
        )}
        {...props}
      />
      {rightIcon && <span className={classes(styles.icon, styles.iconRight)}>
        {rightIcon}
      </span>
      }
    </div>
    <div className={styles.errors}>
      {errors?.map((e, i)=><p key={i}>{e}</p>)}
    </div>
  </div>;
};

export const useFormInputText = (props?: CreateProps) => {
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<string[] | null>([]);
  const [isValid, setIsValid] = useState(false);
  const validate: ValidateFn = async (txt, ctx)=> {
    const required = props?.elementProps?.required ?? false;

    if (required && txt.length === 0) {
      return {
        success: false,
        errors: ["Required field."],
      };
    }

    const fn = props?.validation?.validate;

    if (!fn) {
      return await {
        success: true,
      };
    }

    return fn(txt, ctx);
  };
  const callValidation: CallValidationFn = useCallback((
    async ( { updateErrors, ctx } )=> await validate(value, ctx).then(r=> {
      setIsValid(r.success);

      if (updateErrors)
        setErrors(r.errors ?? null);
    } )), [setIsValid, setErrors, value]);

  // Auto-registro si es una validación repeat
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    const registerFn = (props?.validation?.validate as any)?._registerCallValidation;

    if (registerFn)
      registerFn(callValidation);
  }, [props?.validation, callValidation]);

  const isInitialMount = useRef(true);
  const prevValue = useRef(value);

  useEffect(() => {
    // Si es el mount inicial o el valor no cambió, skipear
    if (isInitialMount.current || prevValue.current === value) {
      isInitialMount.current = false;
      prevValue.current = value;

      return;
    }

    prevValue.current = value;

    callValidation( {
      updateErrors: true,
    } )
      .catch(showError);
  }, [value]);

  useEffect(() => {
    callValidation( {
      updateErrors: false,
    } )
      .catch(showError);
  }, []);
  // eslint-disable-next-line require-await
  const handleInputChange = useCallback(async (e) => {
    const { value: newValue } = e.target;

    setValue(newValue);
  }, [setValue, validate]);

  return {
    value,
    errors,
    isValid,
    callValidation,
    handleInputChange,
  };
};

export type ValidateFn = (value: string, ctx?: any)=> Promise<ValidationResult>;
type ValidationResult = {
  success: boolean;
  errors?: string[];
};

type CreateProps = {
  elementProps?: Props;
  validation?: {
    validate?: ValidateFn;
    hint?: string;
  };
};
type CreateRet = {
  element: JSX.Element;
  value: string;
  isValid: boolean;
  callValidation: CallValidationFn;
};
export const createFormInputText = (props?: CreateProps): CreateRet => {
  const { value, errors, handleInputChange, isValid, callValidation } = useFormInputText(props);
  const placeholder = props?.elementProps?.placeholder ?? "Texto";

  return {
    element: FormInputText( {
      icon: <Title />,
      ...props?.elementProps,
      placeholder: `${placeholder}${!props?.elementProps?.required ? " (opcional)" : ""}`,
      onChange: async (e)=>{
        await handleInputChange(e);
        props?.elementProps?.onChange?.(e);
      },
      value,
      errors,
    } ),
    isValid,
    value,
    callValidation,
  };
};
