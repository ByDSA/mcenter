"use client";

import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { usePageAsyncAction } from "#modules/utils/usePageAsyncAction";
import { useI18nContext } from "#modules/core/i18n/i18n-react";

export default function LogoutPage() {
  const { LL } = useI18nContext();
  const { statusElement: element } = usePageAsyncAction( {
    autoStart: true,
    loadingElement: <p>{LL.core.auth.logout.doingLogout()}</p>,
    errorElement: <p>{LL.core.auth.logout.errorDoingLogout()}</p>,
    action: async () => {
      const res = await fetch(backendUrl(PATH_ROUTES.auth.logout.path), {
        credentials: "include",
      } );

      if (!res.ok)
        throw new Error(LL.core.auth.logout.errorDoingLogout());
    },
    onSuccess: ()=> {
      window.location.replace("/"); // Redirige a "/" (obliga llamada a backend) y borra la página de logout del historial
    },
  } );

  return element;
}
