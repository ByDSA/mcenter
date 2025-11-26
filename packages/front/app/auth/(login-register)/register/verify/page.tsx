"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { backendUrl } from "#modules/requests";
import { usePageAsyncAction } from "#modules/utils/usePageAsyncAction";

export default function RegisterVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { element } = usePageAsyncAction( {
    autoStart: !!token,
    loadingElement: <p>Verificando token ...</p>,
    errorElement: <><p>Error: Token caducado o incorrecto.</p>
      {email && <p>
        <a href={email}>Volver a solicitar token</a>
      </p>
      }</>,
    action: async () => {
      assertIsDefined(token);
      const res = await fetch(
        backendUrl(PATH_ROUTES.auth.local.emailVerification.verify.path),
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          method: "POST",
          body: JSON.stringify( {
            token,
          } ),
        },
      );

      if (!res.ok)
        throw new Error("Verification failed");

      router.replace("/"); // Redirige a "/" y borra la página de verificación del historial
    },
  } );

  return element;
}
