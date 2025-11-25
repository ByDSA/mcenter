"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: (ret?: unknown)=> Promise<void> | void;
  children: ReactNode;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  addBackdrop?: boolean;
  className?: string;
  title?: string;
}

export function Modal( { isOpen,
  onClose,
  children,
  title,
  closeOnClickOutside = true,
  showCloseButton = true,
  addBackdrop = false,
  className = "" }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const handleBackdropClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && e.target === backdropRef.current)
      await onClose();
  };
  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen)
      await onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const modal = modalRef.current;

    if (!isOpen || !modal)
      return;

    const handleWheel = (e: WheelEvent) => {
      const isInsideModal = modal.contains(e.target as Node);

      if (!isInsideModal)
        return;

      let element = e.target as HTMLElement;

      e.preventDefault();

      while (element && element !== modal) {
        const { scrollTop, scrollHeight, clientHeight } = element as HTMLElement;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        const isAtTop = scrollTop <= 1;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          element = element.parentElement as HTMLElement;
          continue;
        }

        element.scrollTop += e.deltaY;
        break;
      }
    };

    modal.addEventListener("wheel", handleWheel, {
      passive: false,
    } );

    return () => {
      modal.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  if (!isOpen)
    return null;

  const modalContent = (
    <div
      ref={backdropRef}
      className={`${styles.backdrop} ${addBackdrop ? styles.withBackground : ""}`}
      onClick={handleBackdropClick}
    >
      <div ref={modalRef}
        className={`${styles.modal} ${className}`}
      >
        <header>
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
        </header>
        <section className={styles.content}>
          {children}
        </section>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
