import { useCallback, useState } from "react";
import { Facebook, GitHub, Person, Twitter } from "@mui/icons-material";
import { LocalLoginBody } from "$shared/models/auth/dto";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { classes } from "#modules/utils/styles";
import styles from "../styles.module.css";
import { LoginRegisterForm } from "../Form";
import { createFormInputText } from "../FormInputText";
import { createFormInputPassword } from "../FormInputPassword";

type Props = {
  handleGoogleLogin?: ()=> Promise<void>;
  handleGithubLogin?: ()=> Promise<void>;
  handleTwitterLogin?: ()=> Promise<void>;
  handleFacebookLogin?: ()=> Promise<void>;
  handleLocalLogin?: (props: LocalLoginBody)=> Promise<void>;
  handleForgotPass?: ()=> Promise<void>;
  handleGotoSignUp?: ()=> Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LoginComponent = ( { handleForgotPass,
  handleLocalLogin,
  handleGotoSignUp,
  handleGoogleLogin,
  handleFacebookLogin,
  handleTwitterLogin,
  handleGithubLogin }: Props) => {
  const hasSocialLogin = !!(handleFacebookLogin || handleGithubLogin || handleGithubLogin
    || handleGoogleLogin);
  const { element: usernameOrEmailElement, value: usernameOrEmail } = createFormInputText( {
    elementProps: {
      icon: <Person />,
      type: "email",
      name: "email",
      placeholder: "Email o usuario",
      className: styles.input,
      required: true,
    },
  } );
  const { element: passwordElement, value: password } = createFormInputPassword( {
    elementProps: {
      name: "password",
      className: styles.input,
      required: true,
    },
  } );
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    await handleLocalLogin?.( {
      usernameOrEmail: usernameOrEmail,
      password: password,
    } ).finally(()=> {
      setIsLoading(false);
    } );
  }, [setIsLoading, handleLocalLogin, usernameOrEmail, password]);

  return <LoginRegisterForm
    title="Login"
    subtitle="Inicia sesión en tu cuenta"
    onSubmit={async (e)=>{
      e.preventDefault();
      await handleSubmit();
    }}
  >
    {hasSocialLogin
      && <div className={styles.socialLogin}>
        {handleGoogleLogin && <button
          type="button"
          className={`${styles.socialButton} ${styles.googleButton}`}
          onClick={() => handleGoogleLogin()}
        >
          <img width="18" height="18" alt="Logo de Google" src="https://auth-cdn.oaistatic.com/assets/google-logo-NePEveMl.svg" />
            Google
        </button>
        }
        {handleGithubLogin
        && <button
          type="button"
          className={`${styles.socialButton} ${styles.githubButton}`}
          onClick={() => handleGithubLogin()}
        >
          <GitHub />
            GitHub
        </button>
        }
        {handleTwitterLogin
        && <button
          type="button"
          className={`${styles.socialButton} ${styles.twitterButton}`}
          onClick={() => handleTwitterLogin()}
        >
          <Twitter />
            Twitter
        </button>
        }

        {handleFacebookLogin
        && <button
          type="button"
          className={`${styles.socialButton} ${styles.facebookButton}`}
          onClick={() => handleFacebookLogin()}
        >
          <Facebook />
            Facebook
        </button>
        }
      </div>
    }

    {hasSocialLogin && handleLocalLogin
      && <div className={styles.divider}>
        <span className={styles.dividerText}>o</span>
      </div>
    }

    {handleLocalLogin
      && <div className={classes(styles.loginForm, styles.inputGroup)}>
        {usernameOrEmailElement}

        {passwordElement}

        <Button
          theme={"dark-gray"}
          type="submit"
          className={classes(styles.loginButton, isLoading && styles.loading)}
          disabled={isLoading
            || usernameOrEmail.length === 0
            || password.length === 0
          }
          onClick={handleSubmit}
        >
          {isLoading
            ? (
              <>
                Iniciando sesión...
              </>
            )
            : (
              <>
                Iniciar Sesión
              </>
            )}
        </Button>
        {handleForgotPass
        && <div className={styles.forgotPassword}>
          <a onClick={()=>handleForgotPass()}>¿Olvidaste tu contraseña?</a>
        </div>
        }
        {handleGotoSignUp && <div className={styles.signupPrompt}>
          ¿No tienes cuenta? <a onClick={()=>handleGotoSignUp()}
            className={styles.signupLink}>Regístrate</a>.
        </div>
        }
        {/* Para que si el botón de local login está disabled, no se llame a otro botón
          al pulsar enter */}
        <button style={{
          display: "none",
        }}type="submit" disabled hidden aria-hidden="true"></button>
      </div>
    }
  </LoginRegisterForm>;
};
