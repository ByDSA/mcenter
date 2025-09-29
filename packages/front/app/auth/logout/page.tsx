"use client";

import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { usePageAsyncAction } from "#modules/utils/usePageAsyncAction";

export default function LogoutPage() {
  const { element } = usePageAsyncAction( {
    autoStart: true,
    loadingMessage: <p>Cerrando sesión ...</p>,
    errorMessage: <p>Error cerrando sesión.</p>,
    action: async () => {
      const res = await fetch(backendUrl(PATH_ROUTES.auth.logout.path), {
        credentials: "include",
      } );

      if (!res.ok)
        throw new Error("Logout failed");

      window.location.replace("/"); // Redirige a "/" (obliga llamada a backend) y borra la página de logout del historial
    },
  } );

  return element;
}
