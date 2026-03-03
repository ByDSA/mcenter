"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { backendUrl } from "#modules/requests";
import { usePageAsyncAction } from "#modules/utils/usePageAsyncAction";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import { useI18nContext } from "#modules/core/i18n/i18n-react";

export default function RegisterVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { LL } = useI18nContext();
  const { statusElement: element } = usePageAsyncAction( {
    autoStart: !!token,
    loadingElement: <p>{LL.core.auth.register.token.verifying()}</p>,
    errorElement: <><p>{LL.core.auth.register.token.error()}</p>
      {email && <p>
        <DaAnchor href={email}>{LL.core.auth.register.token.requestAgain()}</DaAnchor>
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
    },
    onSuccess: ()=> {
      router.replace("/"); // Redirige a "/" y borra la página de verificación del historial
    },
  } );

  return element;
}
