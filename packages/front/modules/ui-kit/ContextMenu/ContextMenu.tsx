"use client";

/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useRef, useEffect, ReactNode, MouseEvent, useCallback, createContext, useContext, useMemo } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./ContextMenu.module.css";

// --- TIPOS ---
type Position = {
  x: number;
  y: number;
};
type OpenMenuProps = {
  className?: string;
  event: MouseEvent<HTMLElement>;
  content: ReactNode;
};
type OpenMenuFn = (props: OpenMenuProps)=> void;

type ContextMenuContextType = {
  openMenu: OpenMenuFn;
  closeMenu: ()=> void;
};

type ContextMenuProps = {
  isOpen: boolean;
  position: Position;
  onClose: ()=> void;
  children: ReactNode;
  className?: string;
  menuRef?: React.RefObject<HTMLDivElement | null>;
};

type SmartPositionOptions = {
  considerScroll?: boolean;
};

// --- HELPERS (Igual que antes) ---
const calculateSmartPosition = (
  triggerRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
  optsParam?: SmartPositionOptions,
): Position => {
  const opts: Required<SmartPositionOptions> = {
    considerScroll: optsParam?.considerScroll ?? true,
  };
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = opts.considerScroll ? window.scrollX : 0;
  const scrollY = opts.considerScroll ? window.scrollY : 0;
  let x = triggerRect.left + scrollX;
  let y = triggerRect.bottom + scrollY + 4;

  if (x + menuWidth > viewportWidth + scrollX) {
    x = triggerRect.right + scrollX - menuWidth;

    if (x < scrollX)
      x = scrollX + 8;
  }

  if (y + menuHeight > viewportHeight + scrollY) {
    y = triggerRect.top + scrollY - menuHeight - 4;

    if (y < scrollY)
      y = scrollY + 8;
  }

  return {
    x,
    y,
  };
};

function isInsideFixedElement(target: Element) {
  let element = target.parentElement;
  let considerScroll = true;

  while (element) {
    if (getComputedStyle(element).position === "fixed") {
      considerScroll = false;
      break;
    }

    element = element.parentElement;
  }

  return considerScroll;
}

// --- COMPONENTE VISUAL (Igual que antes) ---
const ContextMenu = ( { isOpen,
  position,
  onClose,
  children,
  className,
  menuRef }: ContextMenuProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = menuRef || internalRef;

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      const isBackdrop = target?.dataset?.contextBackdrop !== undefined;

      if (isBackdrop) {
        event.preventDefault();
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        onClose();
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside, true);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen)
    return null;

  return (
    <>
      <div className={styles.backdrop} data-context-backdrop />
      <div
        ref={ref}
        className={classes(styles.contextMenu, className, isOpen && styles.open)}
        style={{
          top: position.y,
          left: position.x,
          visibility: position.x === -9999 ? "hidden" : "visible",
        }}
        role="menu"
      >
        {children}
      </div>
    </>
  );
};
// --- CONTEXTO Y PROVIDER ---
const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const ContextMenuProvider = ( { children }: { children: ReactNode } ) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    position: Position;
    content: ReactNode | null;
    className?: string;
  }>( {
    isOpen: false,
    position: {
      x: 0,
      y: 0,
    },
    content: null,
  } );
  // CAMBIO CLAVE: Usamos useRef en lugar de useState.
  // Esto permite leer/escribir el estado "cerrando" sin forzar re-renders,
  // y lo más importante: sin cambiar la dependencia de 'openMenu'.
  const isClosingRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const preventDefault = useCallback((e: Event) => e.preventDefault(), []);
  const disableScroll = useCallback(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("wheel", preventDefault, {
      passive: false,
    } );
    document.addEventListener("touchmove", preventDefault, {
      passive: false,
    } );
  }, [preventDefault]);
  const enableScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.removeEventListener("wheel", preventDefault);
    document.removeEventListener("touchmove", preventDefault);
  }, [preventDefault]);
  const openMenu: OpenMenuFn = useCallback(
    ( { content, event, className } ) => {
      // Leemos la referencia actual. Esto NO crea una dependencia de renderizado.
      if (isClosingRef.current)
        return;

      event.preventDefault();
      event.stopPropagation();

      const trigger = event.currentTarget;
      const triggerRect = trigger.getBoundingClientRect();
      // Asegúrate de tener esta función importada o definida
      const considerScroll = isInsideFixedElement(trigger);

      disableScroll();

      setState( {
        className,
        isOpen: true,
        content,
        position: {
          x: -9999,
          y: -9999,
        },
      } );

      requestAnimationFrame(() => {
        if (menuRef.current) {
          const menuWidth = menuRef.current.offsetWidth;
          const menuHeight = menuRef.current.offsetHeight;
          const smartPosition = calculateSmartPosition(
            triggerRect,
            menuWidth,
            menuHeight,
            {
              considerScroll,
            },
          ); // Asegúrate de tener calculateSmartPosition disponible

          setState((prev) => ( {
            ...prev,
            position: smartPosition,
          } ));
        }
      } );
    },
    [disableScroll],
  );
  const closeMenu = useCallback(() => {
    // Actualizamos la referencia sin provocar re-renders
    isClosingRef.current = true;
    enableScroll();

    setState((prev) => ( {
      ...prev,
      isOpen: false,
    } ));

    setTimeout(() => {
      isClosingRef.current = false;
    }, 150);
  }, [enableScroll]);

  // Listeners globales
  useEffect(() => {
    if (!state.isOpen)
      return;

    const handleScrollResize = preventDefault;

    window.addEventListener("scroll", handleScrollResize, {
      passive: true,
    } );
    window.addEventListener("resize", handleScrollResize);

    return () => {
      window.removeEventListener("scroll", handleScrollResize);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [state.isOpen, preventDefault]);

  useEffect(() => {
    return () => enableScroll();
  }, [enableScroll]);

  // MEMOIZACIÓN FINAL
  // Como openMenu y closeMenu ya no dependen de ningún estado que cambie frecuentemente
  // (solo dependen de enable/disableScroll que son estables),
  // contextValue NUNCA cambiará tras el primer render.
  const contextValue = useMemo(() => ( {
    openMenu,
    closeMenu,
  } ), [openMenu, closeMenu]);

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      <ContextMenu // Asumiendo que ContextMenu está definido arriba o importado
        className={state.className}
        isOpen={state.isOpen}
        position={state.position}
        onClose={closeMenu}
        menuRef={menuRef}
      >
        {state.content}
      </ContextMenu>
    </ContextMenuContext.Provider>
  );
};

// --- HOOK ---
export const useContextMenuTrigger = () => {
  const context = useContext(ContextMenuContext);

  if (!context)
    throw new Error("useContextMenuTrigger must be used within a ContextMenuProvider");

  return context;
};

// --- HELPER ITEMS ---
type CreateContextMenuItemProps = {
  label: string;
  onClick?: (e: MouseEvent<HTMLParagraphElement>)=> void;
  className?: string;
  theme?: "danger" | "default" | "primary" | "success";
};

export const ContextMenuItem = ( { label,
  onClick,
  className,
  theme = "default" }: CreateContextMenuItemProps) => {
  const { closeMenu } = useContextMenuTrigger();

  return (
    <p
      className={classes(
        styles.menuItem,
        onClick && styles.pointer,
        theme === "danger" && styles.danger,
        theme === "primary" && styles.primary,
        theme === "success" && styles.success,
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onClick) {
          onClick(e);
          closeMenu();
        }
      }}
    >
      {label}
    </p>
  );
};
