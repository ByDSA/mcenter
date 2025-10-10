"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function NavigationWatcher() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    sessionStorage.setItem("previousPath", previousPathnameRef.current);

    // Actualizar la referencia para la próxima navegación
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}

export const getPreviousPath = ()=> sessionStorage.getItem("previousPath");
