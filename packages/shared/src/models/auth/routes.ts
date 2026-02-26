import { GoogleState, googleStateSchema } from ".";

const AUTH = "/api/auth";
const AUTH_LOCAL = `${AUTH}/local`;
const AUTH_EMAIL_VERIFICATION = `${AUTH_LOCAL}/email-verification`;
const AUTH_EMAIL_VERIFICATION_FRONT = "/auth/register/verify";

export const authRoutes = {
  path: AUTH,
  frontend: {
    emailVerification: {
      verify: {
        path: AUTH_EMAIL_VERIFICATION_FRONT,
        withParams: (token: string) => `${AUTH_EMAIL_VERIFICATION_FRONT}?token=${token}`,
      },
    },
    login: {
      path: "/auth/login",
      withParams: ( { redirect }: { redirect: string } ) => `/auth/login?redirect=${encodeURI(redirect)}`,
    },
    logout: {
      path: "/auth/logout",
    },
    register: {
      path: "/auth/register",
      done: {
        path: "/auth/register/done",
      },
    },
    userPage: {
      path: "/user",
    },
  },
  logout: {
    path: `${AUTH}/logout`,
  },
  local: {
    path: AUTH_LOCAL,
    login: {
      path: `${AUTH_LOCAL}/login`,
    },
    signup: {
      path: `${AUTH_LOCAL}/signup`,
    },
    emailVerification: {
      verify: {
        path: `${AUTH_EMAIL_VERIFICATION}/verify`,
      },
      resend: {
        path: `${AUTH_EMAIL_VERIFICATION}/resend`,
      },
    },
  },
  google: {
    login: {
      path: `${AUTH}/google`,
      withParams: (state: GoogleState) => `${AUTH}/google?state=${
        encodeURIComponent(JSON.stringify(googleStateSchema.parse(state)))
      }`,
    },
    redirect: {
      path: `${AUTH}/google/redirect`,
    },
  },
};
