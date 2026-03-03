export const AUTH_ES = {
  login: {
    loginButton: "Login",
    user: "usuario",
    emailPlaceholder: "Email o usuario",
    subtitle: "Inicia sesión en tu cuenta",
    doingLogin: "Iniciando sesión...",
    doLogin: "Iniciar sesión",
    youDoLogin: "Accede",
    forgotPassword: "¿Olvidaste tu contraseña?",
    doRegisterAside: "¿No tienes cuenta?",
    wrongLogin: "Usuario o contraseña incorrectos.",
    errorLogin: "Error al iniciar sesión.",
  },
  register: {
    email: "email",
    repeatEmail: "Repetir email",
    password: "Contraseña",
    repeatPassword: "Repetir contraseña",
    name: "Nombre",
    lastname: "Apellidos",
    youDoRegister: "Regístrate",
    doRegister: "Crear cuenta",
    doingRegister: "Creando cuenta...",
    username: "Nombre de usuario",
    subtitle: "Crea una nueva cuenta",
    doLoginAside: "¿Ya tienes cuenta?",
    token: {
      verifying: "Verificando token ...",
      error: "Error: Token caducado o incorrecto.",
      requestAgain: "Volver a solicitar token",
    },
    emailVerification: {
      errorResending: "Error en el reenvío",
      resent: "Enviado email de verificación",
      sentEmail:
          "Te hemos enviado un correo a [email] para verificar tu cuenta. Si en unos minutos no lo \
recibes, haz clic [link] para reenviarlo.",
      disabledTitle: "Desactivado temporalmente",
      linkText: "aquí",
      subMessage: "Puedes cerrar esta página cuando quieras.",
    },
  },
  logout: {
    tab: "Cerrar sesión",
    doingLogout: "Cerrando sesión ...",
    errorDoingLogout: "Error cerrando sesión.",
  },
} as const;

export const AUTH_EN = {
  login: {
    loginButton: "Login",
    user: "user",
    emailPlaceholder: "Email or username",
    subtitle: "Sign in to your account",
    doingLogin: "Signing in...",
    doLogin: "Sign in",
    youDoLogin: "Sign in",
    forgotPassword: "Forgot your password?",
    doRegisterAside: "Don't have an account?",
    wrongLogin: "Incorrect username or password.",
    errorLogin: "Error signing in.",
  },
  register: {
    email: "email",
    repeatEmail: "Repeat email",
    password: "Password",
    repeatPassword: "Repeat password",
    name: "First name",
    lastname: "Last name",
    youDoRegister: "Sign up",
    doRegister: "Create account",
    doingRegister: "Creating account...",
    username: "Username",
    subtitle: "Create a new account",
    doLoginAside: "Already have an account?",
    token: {
      verifying: "Verifying token...",
      error: "Error: Token expired or invalid.",
      requestAgain: "Request token again",
    },
    emailVerification: {
      errorResending: "Error resending",
      resent: "Verification email sent",
      sentEmail:
        "We've sent an email to [email] to verify your account. If you don't receive it within a \
few minutes, click [link] to resend it.",
      disabledTitle: "Temporarily disabled",
      linkText: "here",
      subMessage: "You can close this page whenever you want.",
    },
  },
  logout: {
    tab: "Sign out",
    doingLogout: "Signing out...",
    errorDoingLogout: "Error signing out.",
  },
} as const;
