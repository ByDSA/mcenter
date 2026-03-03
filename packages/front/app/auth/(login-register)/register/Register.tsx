import { useEffect, useRef, useState } from "react";
import { AuthCrudDtos } from "$shared/models/auth/dto/transport";
import { Email, Person } from "@mui/icons-material";
import { showError } from "$shared/utils/errors/showError";
import z from "zod";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { classes } from "#modules/utils/styles";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { phraseCase } from "#modules/core/i18n/utils";
import styles from "../styles.module.css";
import { LoginRegisterForm } from "../Form";
import { CallValidationFn, createFormInputText, ValidateFn } from "../FormInputText";
import { createFormInputPassword } from "../FormInputPassword";

type Props = {
  handleRegister: (props: AuthCrudDtos.LocalSignUp.Body)=> Promise<void>;
  handleGotoLogin?: ()=> Promise<void>;
  className?: string;
};

export const RegisterComponent = ( { handleRegister, handleGotoLogin, className }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { LL } = useI18nContext();
  const { element: usernameElement,
    value: username,
    isValid: usernameIsValid } = createFormInputText( {
    elementProps: {
      icon: <Person />,
      placeholder: LL.core.auth.register.username(),
      required: true,
    },
  } );
  const { element: emailElement,
    value: email,
    isValid: emailIsValid } = createFormInputText( {
    elementProps: {
      icon: <Email />,
      type: "email",
      placeholder: phraseCase(LL.core.auth.register.email()),
      required: true,
    },
    validation: {
      validate: async (txt) => {
        const { success } = z.string().email()
          .safeParse(txt);
        const errors: string[] = [];

        if (!success)
          errors.push(LL.uikit.forms.errors.invalidEmail());

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
      placeholder: LL.core.auth.register.repeatEmail(),
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
      placeholder: LL.core.auth.register.repeatPassword(),
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
      placeholder: LL.core.auth.register.name(),
      required: false,
    },
  } );
  const { element: lastNameElement,
    value: lastName,
    isValid: lastNameIsValid } = createFormInputText( {
    elementProps: {
      placeholder: LL.core.auth.register.lastname(),
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
    title={LL.core.auth.register.youDoRegister()}
    subtitle={LL.core.auth.register.subtitle()}
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
      <DaButton
        className={classes(styles.loginButton, isLoading && styles.loading)}
        disabled={isLoading || !allIsValid}
        onClick={handleSubmit}
      >
        {isLoading
          ? (
            <>
              {LL.core.auth.register.doingRegister()}
            </>
          )
          : (
            <>
              {LL.core.auth.register.doRegister()}
            </>
          )}
      </DaButton>
    </div>
    {handleGotoLogin
    && <div className={styles.signupPrompt}>
      {LL.core.auth.register.doLoginAside()} <DaAnchor onClick={()=>handleGotoLogin()}
        className={styles.signupLink}>{LL.core.auth.login.youDoLogin()}</DaAnchor>.
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
  const { LL } = useI18nContext();
  const validate = (async (txt: string, ctx: any) => {
    const p = ctx?.updatedValue ?? updatedValue;
    const success = txt === p;
    const errors: string[] = [];

    if (!success)
      errors.push(LL.uikit.forms.errors.matchFields());

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
