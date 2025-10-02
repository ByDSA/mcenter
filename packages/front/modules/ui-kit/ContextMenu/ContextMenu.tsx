/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useRef, useEffect, ReactNode, MouseEvent, useCallback } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./ContextMenu.module.css";

// Types
type Position = {
  x: number;
  y: number;
};

type ContextMenuProps = {
  isOpen: boolean;
  position: Position;
  onClose: ()=> void;
  children: ReactNode;
  className?: string;
};

type UseContextMenuProps<T> = {
  renderChildren: (value: T)=> ReactNode;
  className?: string;
};

// Función para calcular la posición inteligente
const calculateSmartPosition = (
  triggerRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
): Position => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const { scrollX } = window;
  const { scrollY } = window;
  // Posición inicial preferida (debajo del elemento)
  let x = triggerRect.left + scrollX;
  let y = triggerRect.bottom + scrollY + 4;

  // Ajustar horizontalmente si se sale de la ventana
  if (x + menuWidth > viewportWidth + scrollX) {
    // Si no cabe a la derecha, alinear por la derecha
    x = triggerRect.right + scrollX - menuWidth;

    // Si aún se sale por la izquierda, alinear con el borde izquierdo de la ventana
    if (x < scrollX)
      x = scrollX + 8; // 8px de margen
  }

  // Ajustar verticalmente si se sale de la ventana
  if (y + menuHeight > viewportHeight + scrollY) {
    // Intentar posicionar arriba del elemento
    y = triggerRect.top + scrollY - menuHeight - 4;

    // Si tampoco cabe arriba, posicionar dentro de la ventana
    if (y < scrollY)
      y = scrollY + 8; // 8px de margen desde el top
  }

  return {
    x,
    y,
  };
};
const ContextMenu = ( { isOpen,
  position,
  onClose,
  children,
  className,
  menuRef }: ContextMenuProps & { menuRef?: React.RefObject<HTMLDivElement> } ) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = menuRef || internalRef;

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        onClose();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen)
    return null;

  return (
    <div
      ref={ref}
      className={classes(styles.contextMenu, className, isOpen && styles.open)}
      style={{
        top: position.y,
        left: position.x,
      }}
      role="menu"
    >
      {children}
    </div>
  );
};

export const useListContextMenu = <T, >(config: UseContextMenuProps<T>) => {
  const { closeMenu: _closeMenu,
    isOpen, openMenu: _openMenu,
    renderContextMenu } = useContextMenu(config);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const openMenu = ( { index, event }: {
    index: number;
    event: MouseEvent<HTMLElement>;
  } ): boolean => {
    const ret = _openMenu( {
      event,
      forceOpen: index !== activeIndex,
    } );

    if (ret)
      setActiveIndex(index);

    return ret;
  };
  const closeMenu = useCallback(() => {
    _closeMenu();
    setActiveIndex(null);

    return true;
  }, [_closeMenu]);

  return {
    renderContextMenu,
    openMenu,
    closeMenu,
    activeIndex,
    isOpen,
  };
};

export const useContextMenu = <T, >(config: UseContextMenuProps<T>) => {
  const { renderChildren, className } = config;
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState<Position>( {
    x: 0,
    y: 0,
  } );
  const menuRef = useRef<HTMLDivElement>(null);
  // Función para prevenir scroll
  const preventDefault = useCallback((e: Event) => {
    e.preventDefault();
  }, []);
  // Funciones para manejar el scroll
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
  const openMenu = ( { event, forceOpen = false }: {
    event: MouseEvent<HTMLElement>;
    forceOpen?: boolean;
  } ) => {
    if (isClosing && !forceOpen)
      return false;

    // Deshabilitar scroll
    disableScroll();

    const triggerRect = event.currentTarget.getBoundingClientRect();

    setPosition( {
      x: -9999,
      y: -9999,
    } );
    setIsOpen(true);

    requestAnimationFrame(() => {
      if (menuRef.current) {
        const menuWidth = menuRef.current.offsetWidth;
        const menuHeight = menuRef.current.offsetHeight;
        const smartPosition = calculateSmartPosition(triggerRect, menuWidth, menuHeight);

        setPosition(smartPosition);
      } else {
        const smartPosition = calculateSmartPosition(triggerRect, 200, 200);

        setPosition(smartPosition);
      }
    } );

    return true;
  };
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setIsClosing(true);

    // Rehabilitar scroll
    enableScroll();

    setTimeout(() => {
      setIsClosing(false);
    }, 100);

    return true;
  }, [enableScroll]);

  // Cleanup en caso de que el componente se desmonte con el menú abierto
  useEffect(() => {
    return () => {
      if (isOpen)
        enableScroll();
    };
  }, [isOpen, enableScroll]);

  // Resto del código sin cambios...
  useEffect(() => {
    if (!isOpen)
      return;

    const handleScroll = preventDefault;
    const handleResize = preventDefault;

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    } );
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return {
    renderContextMenu: (value: T) =><ContextMenu
      className={className}
      isOpen={isOpen}
      position={position}
      onClose={closeMenu}
      menuRef={menuRef}
    >
      {renderChildren(value)}
    </ContextMenu>,
    openMenu,
    closeMenu,
    isOpen,
  };
};
