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
type Props = {
  userAgent?: string;
};
export const isMobile = (props?: Props): boolean => {
  const ua = props?.userAgent ?? (isClient() ? window.navigator.userAgent : "");
  const hasMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  return hasMobileUserAgent;
};

/**
 * Detecta si el usuario está en un dispositivo desktop.
 * Se define simplemente como lo opuesto a un dispositivo móvil.
 */
type Env = "desktop" | "mobile";
export const getBrowserEnv = (props?: Props): Env => {
  if (isMobile(props))
    return "mobile";

  return "desktop";
};
