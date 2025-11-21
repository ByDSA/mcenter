"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: ()=> void;
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

  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el modal está abierto
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && e.target === backdropRef.current)
      onClose();

    e.stopPropagation(); // Para que no reciba el evento de click el parent del modal
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen)
      onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen)
    return null;

  const modalContent = (
    <div
      ref={backdropRef}
      className={`${styles.backdrop} ${addBackdrop ? styles.withBackground : ""}`}
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className={`${styles.modal} ${className}`}>
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
