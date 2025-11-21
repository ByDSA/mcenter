import { useEffect, useRef, useState } from "react";
import { LocalSignUpBody } from "$shared/models/auth/dto";
import { Email, Person } from "@mui/icons-material";
import { showError } from "$shared/utils/errors/showError";
import z from "zod";
import { Button } from "#modules/ui-kit/input/Button";
import { classes } from "#modules/utils/styles";
import styles from "../styles.module.css";
import { LoginRegisterForm } from "../Form";
import { CallValidationFn, createFormInputText, ValidateFn } from "../FormInputText";
import { createFormInputPassword } from "../FormInputPassword";

type Props = {
  handleRegister: (props: LocalSignUpBody)=> Promise<void>;
  handleGotoLogin?: ()=> Promise<void>;
  className?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RegisterComponent = ( { handleRegister, handleGotoLogin, className }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { element: usernameElement,
    value: username,
    isValid: usernameIsValid } = createFormInputText( {
    elementProps: {
      icon: <Person />,
      placeholder: "Nombre de usuario",
      required: true,
    },
  } );
  const { element: emailElement,
    value: email,
    isValid: emailIsValid } = createFormInputText( {
    elementProps: {
      icon: <Email />,
      type: "email",
      placeholder: "Email",
      required: true,
    },
    validation: {
      validate: async (txt) => {
        const { success } = z.string().email()
          .safeParse(txt);
        const errors: string[] = [];

        if (!success)
          errors.push("Invalid email format.");

        return await {
          success,
          errors,
        };
      },
    },
  } );
  const { validate: validateRepeatEmail } = useRepeatValidation( {
    updatedValue: email,
  } );
  const { element: emailRepeatElement,
    isValid: emailRepeatIsValid } = createFormInputText( {
    elementProps: {
      icon: <Email />,
      type: "email",
      placeholder: "Repetir Email",
      required: true,
    },
    validation: {
      validate: validateRepeatEmail,
    },
  } );
  const { element: passwordElement,
    value: password,
    isValid: passwordIsValid } = createFormInputPassword( {
    elementProps: {
      required: true,
    },
  } );
  const { validate: validateRepeatPassword } = useRepeatValidation( {
    updatedValue: password,
  } );
  const { element: passwordRepeatElement,
    isValid: passwordRepeatIsValid } = createFormInputPassword( {
    elementProps: {
      placeholder: "Repetir contraseña",
      required: true,
    },
    validation: {
      validate: validateRepeatPassword,
    },
  } );
  const { element: firstNameElement,
    value: firstName,
    isValid: firstNameIsValid } = createFormInputText( {
    elementProps: {
      placeholder: "Nombre",
      required: false,
    },
  } );
  const { element: lastNameElement,
    value: lastName,
    isValid: lastNameIsValid } = createFormInputText( {
    elementProps: {
      placeholder: "Apellidos",
      required: false,
    },
  } );
  const handleSubmit = async () => {
    setIsLoading(true);

    await handleRegister( {
      email,
      password,
      username,
      firstName,
      lastName,
    } ).finally(()=> {
      setIsLoading(false);
    } );
  };
  const allIsValid = usernameIsValid
    && emailIsValid && emailRepeatIsValid
    && firstNameIsValid && lastNameIsValid
    && passwordIsValid && passwordRepeatIsValid;

  return <LoginRegisterForm
    title="Regístrate"
    subtitle="Crea una nueva cuenta"
    className={className}
  >
    <div className={classes(styles.inputGroup)}>
      {usernameElement}
      {emailElement}
      {emailRepeatElement}
      {passwordElement}
      {passwordRepeatElement}
      {firstNameElement}
      {lastNameElement}
      <Button
        className={classes(styles.loginButton, isLoading && styles.loading)}
        disabled={isLoading || !allIsValid}
        onClick={handleSubmit}
      >
        {isLoading
          ? (
            <>
                Creando cuenta...
            </>
          )
          : (
            <>
                Crear cuenta
            </>
          )}
      </Button>
    </div>
    {handleGotoLogin
    && <div className={styles.signupPrompt}>
          ¿Ya tienes cuenta? <a onClick={()=>handleGotoLogin()}
        className={styles.signupLink}>Accede</a>.
    </div>
    }
  </LoginRegisterForm>;
};

type UseRepeatValidationProps<T> = {
  updatedValue: T;
};
function useRepeatValidation<T>( { updatedValue }: UseRepeatValidationProps<T>) {
  const callValidationRef = useRef<CallValidationFn>(null);
  const setterRef = useRef<(fn: CallValidationFn)=> void>(null);

  // Crear un "canal" para recibir la función
  useEffect(() => {
    setterRef.current = (fn: CallValidationFn) => {
      callValidationRef.current = fn;
    };
  }, []);
  const isFirstRender = useRef(true);

  useEffect(()=> {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return; // No ejecutar en el primer render
    }

    const callValidation = callValidationRef.current;

    callValidation?.( {
      updateErrors: true,
      ctx: {
        updatedValue,
      },
    } )
      .catch(showError);
  }, [updatedValue]);

  const validate = (async (txt: string, ctx: any) => {
    const p = ctx?.updatedValue ?? updatedValue;
    const success = txt === p;
    const errors: string[] = [];

    if (!success)
      errors.push("Fields should match.");

    return await {
      success,
      errors,
    };
  } ) as ValidateFn;

  // "Marcar" la función para que createFormInputPassword la detecte
  // eslint-disable-next-line no-underscore-dangle
  (validate as any)._registerCallValidation = setterRef.current;

  return {
    validate,
  };
}
