"use client";

import { useEffect, useRef, ReactNode, useMemo } from "react";
import { createPortal } from "react-dom";
import { classes } from "#modules/utils/styles";
import styles from "./Modal.module.css";

type Refs = {
  modal: HTMLDivElement | null;
  backdrop: HTMLDivElement | null;
};

interface ModalProps {
  isOpen: boolean;
  onClose: (ret?: unknown)=> Promise<void> | void;
  children: ReactNode;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  showBox?: boolean;
  showHeader?: boolean;
  addBackdrop?: boolean;
  className?: string;
  title?: string;
  onRefs?: (refs: Refs)=> void;
}

export function Modal( { isOpen,
  onClose,
  children,
  title,
  closeOnClickOutside = true,
  showCloseButton = true,
  showBox = true,
  showHeader = true,
  addBackdrop = false,
  className = "",
  onRefs }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const targetStartClick = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onRefs) {
      onRefs( {
        modal: modalRef.current,
        backdrop: backdropRef.current,
      } );
    }
  }, [onRefs, isOpen]);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    targetStartClick.current = e.target as HTMLDivElement;
  };
  const handleBackdropClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const targetEndClick = document.elementFromPoint(e.clientX, e.clientY);

    if (closeOnClickOutside
      && targetEndClick === backdropRef.current
      && targetEndClick === targetStartClick.current)
      await onClose();

    targetStartClick.current = null;
  };
  const handleWheel = useMemo(()=>(e: WheelEvent) => {
    const backdrop = backdropRef.current;

    // 1. Si el evento es directo en el backdrop, bloquear siempre.
    if (e.target === backdrop) {
      e.preventDefault();

      return;
    }

    const { deltaY } = e;
    let target = e.target as HTMLElement;
    let shouldBlock = true;

    // 2. Recorremos desde el elemento target hacia arriba hasta llegar al backdrop
    while (target && target !== backdrop) {
      // Obtenemos estilos para saber si el elemento tiene scroll activado
      const style = window.getComputedStyle(target);
      const { overflowY } = style;
      const isScrollable = overflowY === "auto" || overflowY === "scroll";
      // Verificamos si matemáticamente tiene contenido para scrollear
      const canScrollMath = target.scrollHeight > target.clientHeight;

      if (isScrollable && canScrollMath) {
        // Calculamos los límites con un margen de error de 1px (para pantallas de alta densidad)
        const { scrollTop, scrollHeight, clientHeight } = target;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

        // LOGICA CLAVE:
        // Si scrollea ARRIBA (delta negativo) y NO está arriba del todo -> Lo permitimos
        if (deltaY < 0 && !isAtTop) {
          shouldBlock = false;
          break; // Encontramos quién scrollea, dejamos de buscar
        }

        // Si scrollea ABAJO (delta positivo) y NO está abajo del todo -> Lo permitimos
        if (deltaY > 0 && !isAtBottom) {
          shouldBlock = false;
          break; // Encontramos quién scrollea, dejamos de buscar
        }

        // Si llegamos aquí es porque el elemento ES scrollable pero está en el TOPE.
        // En este caso, NO hacemos break, seguimos subiendo al padre
        // (por si hay un modal dentro de otro modal, o un textarea dentro del modal).
      }

      // Subimos al siguiente padre
      target = target.parentElement as HTMLElement;
    }

    // 3. Si recorrimos todo y no encontramos quien se haga cargo legítimamente -> Bloquear
    if (shouldBlock)
      e.preventDefault();
  }, [backdropRef.current]);

  useEffect(() => {
    const backdrop = backdropRef.current;

    // Necesitamos que existan el backdrop y que esté abierto
    if (!isOpen || !backdrop)
      return;

    // Usamos passive: false para poder cancelar el evento
    backdrop.addEventListener("wheel", handleWheel, {
      passive: false,
    } );

    return () => {
      backdrop.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  if (!isOpen)
    return null;

  const backdropAndModalContent = (
    <div
      ref={backdropRef}
      className={classes(styles.backdrop, addBackdrop && styles.withBackground)}
      onMouseDown={handleMouseDown}
      onClick={handleBackdropClick}
    >

      <div ref={modalRef}
        className={classes(showBox && styles.modal, showBox && className)}
      >
        {
          showBox && showHeader && <header>
            {
              title && <span className={styles.title}>{title}</span>
            }
            {showCloseButton && (
              <button
                className={styles.closeButton}
                onClick={()=>onClose()}
                title="Cerrar"
                aria-label="Cerrar"
              >
            ×
              </button>
            )}
          </header>}

        {showBox
          ? <section className={styles.content}>
            {children}
          </section>
          : children
        }
      </div>

    </div>
  );

  return createPortal(backdropAndModalContent, document.body);
}
