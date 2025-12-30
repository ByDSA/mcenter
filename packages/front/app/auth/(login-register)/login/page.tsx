"use client";

/* eslint-disable require-await */
import { PATH_ROUTES } from "$shared/routing";
import { useRouter, useSearchParams } from "next/navigation";
import { backendUrl } from "#modules/requests";
import { AuthApi } from "#modules/core/auth/requests";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { HttpErrorUnauthorized } from "#modules/core/errors/custom-errors";
import { LoginComponent } from "./Login";

function useLoginGoogle() {
  const searchParams = useSearchParams();

  return {
    loginGoogle: () => {
      const redirectQueryParam = searchParams.get("redirect") ?? window.location.origin;
      const newUrl = redirectQueryParam
        ? PATH_ROUTES.auth.google.login.withParams( {
          redirect: redirectQueryParam,
        } )
        : PATH_ROUTES.auth.google.login.path;

      window.location.href = backendUrl(newUrl); // Se obliga a llamada a backend
    },
  };
}

export default function LoginPage() {
  const { loginGoogle } = useLoginGoogle();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handleLocalLogin: Parameters<
  typeof LoginComponent
>[0]["handleLocalLogin"] = async ( { password, usernameOrEmail } ) => {
  const api = FetchApi.get(AuthApi);

  try {
    await api.localLogin( {
      usernameOrEmail,
      password,
    } );

    const redirectUrl = searchParams.get("redirect");

    window.location.href = redirectUrl ?? "/"; // Se obliga a llamada a backend
  } catch (e) {
    if (e instanceof HttpErrorUnauthorized)
      logger.error("Login wrong!");
    else
      logger.error("Login failed!");
  }
};

  return <div>
    {LoginComponent( {
      handleGoogleLogin: async ()=>loginGoogle(),
      handleLocalLogin,
      handleGotoSignUp: async ()=> {
        router.push("./register");
      },
    } )
    }
  </div>;
}
