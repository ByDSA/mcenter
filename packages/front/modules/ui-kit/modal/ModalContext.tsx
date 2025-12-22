"use client";

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode } from "react";
import { Modal } from "./Modal";

export type OpenModalProps = {
  closeOnClickOutside?: boolean;
  showBox?: boolean;
  showHeader?: boolean;
  showCloseButton?: boolean;
  addBackdrop?: boolean;
  className?: string;
  title?: string;
  onClose?: (returnObj?: unknown)=> Promise<void> | void;
  onOpen?: ()=> void;
  content?: ReactNode;
};

// ... (Tus tipos ModalInstance, etc. se mantienen igual)
type ModalInstance = {
  id: string;
  isOpen: boolean;
  content: ReactNode | null;
  options: OpenModalProps;
};

type ModalContextType = {
  _open: (id: string, options: OpenModalProps)=> void;
  _close: (id: string, returnObj?: unknown)=> void;
  _setContent: (id: string, content: ReactNode)=> void;
  _isModalOpen: (id: string)=> boolean;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);
// Para guardar la id entre los renders y poder cerrar el modal
const CurrentModalIdContext = createContext<string | null>(null);

export const ModalProvider = ( { children }: { children: ReactNode } ) => {
  const [modals, setModals] = useState<ModalInstance[]>([]);
  const _open = useCallback((id: string, options: OpenModalProps) => {
    setModals((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === id);
      const newInstance: ModalInstance = {
        id,
        isOpen: true,
        content: options.content || null,
        options,
      };

      if (existingIndex >= 0) {
        const newModals = [...prev];

        newModals[existingIndex] = newInstance;

        return newModals;
      }

      return [...prev, newInstance];
    } );
    options.onOpen?.();
  }, []);
  const _close = useCallback(async (id: string, returnObj?: unknown) => {
    let modalOptions: OpenModalProps | undefined;

    await new Promise<void>((resolve) => {
      setModals((prev) => {
        const modal = prev.find((m) => m.id === id);

        if (modal) {
          modalOptions = modal.options;
          resolve();

          return prev.filter((m) => m.id !== id);
        }

        resolve();

        return prev;
      } );
    } );

    if (modalOptions?.onClose)
      await modalOptions.onClose(returnObj);
  }, []);
  const _setContent = useCallback((id: string, content: ReactNode) => {
    setModals((prev) => prev.map((m) => (m.id === id
      ? {
        ...m,
        content,
      }
      : m)));
  }, []);
  const _isModalOpen = useCallback(
    (id: string) => modals.some((m) => m.id === id && m.isOpen),
    [modals],
  );

  return (
    <ModalContext.Provider value={{
      _open,
      _close,
      _setContent,
      _isModalOpen,
    }}>
      {children}

      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={modal.isOpen}
          title={modal.options.title}
          onClose={(ret) => _close(modal.id, ret)}
          closeOnClickOutside={modal.options.closeOnClickOutside}
          showCloseButton={modal.options.showCloseButton}
          showHeader={modal.options.showHeader}
          showBox={modal.options.showBox}
          addBackdrop={modal.options.addBackdrop}
          className={modal.options.className}
        >
          <CurrentModalIdContext.Provider value={modal.id}>
            {modal.content}
          </CurrentModalIdContext.Provider>
        </Modal>
      ))}
    </ModalContext.Provider>
  );
};

export const useModal = (useParent: boolean = false) => {
  const context = useContext(ModalContext);
  const parentModalId = useContext(CurrentModalIdContext);

  if (!context)
    throw new Error("useModal debe ser usado dentro de un ModalProvider");

  const myIdRef = useRef(`modal-${Math.random().toString(36)
    .substring(2, 9)}`);
  const myOwnId = myIdRef.current;
  const targetId = (parentModalId && useParent) ? parentModalId : myOwnId;
  // 1. Refs para controlar la promesa y su resolución
  // Guardamos la función 'resolve' para llamarla cuando el modal se cierre.
  const resolverRef = useRef<((value: unknown)=> void) | null>(null);
  // Guardamos la promesa activa actual.
  const promiseRef = useRef<Promise<unknown> | null>(null);
  const openModal = useCallback(
    (options: OpenModalProps = {} ) => {
      // Creamos una nueva promesa "controlada"
      let resolveFn: (value: unknown)=> void;
      const promise = new Promise<unknown>((resolve) => {
        resolveFn = resolve;
      } );

      // Guardamos las referencias
      promiseRef.current = promise;
      resolverRef.current = resolveFn!;

      // Interceptamos el onClose original para resolver la promesa
      const originalOnClose = options.onClose;
      const interceptorOnClose = async (returnObj?: unknown) => {
        // Ejecutar lógica original si existe
        if (originalOnClose)
          await originalOnClose(returnObj);

        // Resolver nuestra promesa pendiente
        if (resolverRef.current) {
          resolverRef.current(returnObj);
          resolverRef.current = null; // Limpieza
        }
      };

      // Abrimos el modal inyectando nuestro interceptor
      context._open(myOwnId, {
        ...options,
        onClose: interceptorOnClose,
      } );

      // Devolvemos la promesa para permitir: await openModal(...)
      return promise;
    },
    [context, myOwnId],
  );
  const closeModal = useCallback(
    (returnObj?: unknown) => {
      return context._close(targetId, returnObj);
    },
    [context, targetId],
  );

  return {
    openModal,
    closeModal,
    // Helper: devuelve true si el modal relevante está abierto
    isOpen: context._isModalOpen(targetId),
    id: targetId,
  };
};
