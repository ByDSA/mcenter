"use client";

import { createContext, useContext, useState, ReactNode, JSX, useRef, useEffect, useCallback } from "react";
import { sleep } from "$shared/utils/sleep";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { PlayerFullscreenView } from "../../Fullscreen/FullscreenView";
import { PlayerWindowView } from "./Window";

/**
 * Por qué pushState (y no replaceState):
 *   replaceState no añade un entry al stack → el back button navega a la página anterior
 *   ANTES de que podamos reaccionar. No hay forma de interceptarlo.
 *   pushState sí añade un entry "buffer" que absorbe el back sin navegar. ✓
 *
 * Stack al abrir fullscreen:  [...páginas_anteriores | página_actual | fullscreen*]
 *
 * Flujo back button:
 *   Back → navegamos a página_actual (el entry fullscreen queda como redo ghost).
 *   popstate dispara → cerramos fullscreen. Sin navegación adicional. ✓
 *   Ghost redo: misma URL que página_actual → inofensivo (si se hace forward, mismo contenido).
 *
 * Flujo X button:
 *   history.back() → elimina el entry fullscreen (lo consume como navegación de vuelta).
 *   popstate dispara PERO isFullscreenOpenRef ya es false → handler lo ignora. ✓
 *
 * Flujo route change mientras fullscreen abierto:
 *   Next.js navega forward con pushState → stack: [..., página_actual, fullscreen, nueva_página*]
 *   Nuestro useEffect(pathname) dispara → closeImpl(). El entry fullscreen queda en back history
 *   (misma URL que página_actual, inofensivo). ✓
 *
 * Tradeoff aceptado: pushState destruye el redo existente al abrir el fullscreen.
 *   En mobile, el forward/redo no se usa prácticamente. Es el tradeoff necesario para
 *   que el back button no navegue fuera de la app.
 */

type WindowContextType = {
  mountNode: JSX.Element;
  open: (props: {
    content: ReactNode;
    className?: string;
    fullscreen?: boolean;
    name?: string;
  } )=> Promise<void>;
  close: ()=> Promise<void>;
  isOpen: boolean;
  isFullscreen: boolean;
  currentWindowName?: string;
};

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider = ( { children }: { children: ReactNode } ) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [windowMountNode, setWindowMountNode] = useState<HTMLSpanElement | null>(null);
  const [config, setConfig] = useState<Parameters<WindowContextType["open"]>[0] | null>(null);
  // Ref para saber si el fullscreen está abierto (usable en event handlers sin closures stale)
  const isFullscreenOpenRef = useRef(false);
  const pathname = usePathname();
  // Animación de cierre + reset de estado. No toca el historial.
  const closeImpl = useCallback(async () => {
    isFullscreenOpenRef.current = false;
    setIsClosing(true);
    await sleep(200);
    setIsClosing(false);
    setIsOpen(false);
    setConfig(null);
  }, []);
  const open: WindowContextType["open"] = useCallback(async (props) => {
    if (isOpen) {
      if (isFullscreenOpenRef.current) {
        // Había fullscreen abierto: marcamos el ref a false ANTES de history.back()
        // para que el popstate resultante sea ignorado por el handler.
        isFullscreenOpenRef.current = false;
        history.back(); // Elimina el entry fullscreen anterior
        await sleep(50); // Cede al event loop para que el popstate se despache y sea ignorado
      }

      await closeImpl();
    }

    setConfig(props);
    setIsOpen(true);

    if (props.fullscreen) {
      // pushState añade un entry "buffer": back button lo consumirá sin navegar fuera. ✓
      history.pushState( {
        playerFullscreen: true,
      }, "");
      isFullscreenOpenRef.current = true;
    }
  }, [isOpen, closeImpl]);
  const close = useCallback(async () => {
    if (isFullscreenOpenRef.current) {
      // X button: marcamos ref a false ANTES de history.back() para ignorar el popstate.
      isFullscreenOpenRef.current = false;
      history.back(); // Elimina el entry fullscreen del historial
      // No esperamos a que popstate se despache; closeImpl corre en paralelo.
    }

    await closeImpl();
  }, [closeImpl]);

  // Back button del navegador con fullscreen abierto → solo cerrar, sin navegar más.
  useEffect(() => {
    const handlePopState = () => {
      if (!isFullscreenOpenRef.current)
        return;

      // El back button consumió el entry fullscreen (pushState).
      // Ahora estamos en la página anterior. Solo cerramos el fullscreen.
      // El entry fullscreen queda como ghost-redo (misma URL → inofensivo).
      void closeImpl();
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [closeImpl]);

  // Cambio de ruta mientras el fullscreen está abierto → minimizar para ver la nueva página.
  useEffect(() => {
    if (isFullscreenOpenRef.current)
      void closeImpl();
  }, [pathname]);

  const value: WindowContextType = {
    mountNode: <span ref={setWindowMountNode}></span>,
    open,
    close,
    isOpen,
    isFullscreen: !!config?.fullscreen,
    currentWindowName: config?.name,
  };

  return (
    <WindowContext.Provider value={value}>
      {isOpen && windowMountNode && !config?.fullscreen && createPortal(
        <PlayerWindowView
          className={config?.className}
          close={() => close()}
          state={isClosing ? "closed" : "open"}
        >
          {config?.content}
        </PlayerWindowView>,
        windowMountNode,
      )}
      {isOpen && windowMountNode && config?.fullscreen && createPortal(
        <PlayerFullscreenView
          className={config?.className}
          close={() => close()}
          state={isClosing ? "closed" : "open"}
        >{config?.content}</PlayerFullscreenView>,
        windowMountNode,
      )}
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => {
  const context = useContext(WindowContext);

  if (!context)
    throw new Error("useWindowContext debe usarse dentro de un WindowProvider");

  return context;
};
