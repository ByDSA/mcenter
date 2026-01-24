/**
 * utils.ts - Utilidades para detección de entorno en Next.js
 * * Este archivo proporciona funciones para identificar el dispositivo del usuario
 * y el modo de visualización (Navegador vs App Instalada/PWA).
 */

/**
 * Comprueba si el código se está ejecutando en el lado del cliente (navegador).
 */
export const isClient = (): boolean => typeof window !== "undefined";

/**
 * Detecta si la aplicación se está ejecutando como una PWA instalada
 * (Standalone mode) en iOS o Android/Desktop.
 */
export const isInstalledApp = (): boolean => {
  if (!isClient())
    return false;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const isIOSStandalone = (window.navigator as any).standalone === true;

  return isStandalone || isIOSStandalone;
};

/**
 * Detecta si el usuario está en un dispositivo móvil basándose en el User Agent.
 * Útil para lógica que debe ejecutarse antes de que el layout CSS cargue.
 */
export const isMobile = (userAgent?: string): boolean => {
  const ua = userAgent || (isClient() ? window.navigator.userAgent : "");

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
};

/**
 * Detecta si el usuario está en un dispositivo desktop.
 * Se define simplemente como lo opuesto a un dispositivo móvil.
 */
export const isDesktop = (userAgent?: string): boolean => {
  return !isMobile(userAgent);
};

/**
 * Hook de ejemplo o utilidad combinada para obtener el estado del dispositivo.
 * Nota: En Next.js, si usas esto en componentes de servidor, debes pasar el
 * User Agent desde los headers de la petición.
 */
export const getDeviceType = (userAgent?: string) => {
  return {
    isMobile: isMobile(userAgent),
    isDesktop: isDesktop(userAgent),
    isInstalled: isInstalledApp(),
  };
};
