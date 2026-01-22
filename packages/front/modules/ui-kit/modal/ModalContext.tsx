"use client";

/* eslint-disable no-underscore-dangle */
import { createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useEffect } from "react";
import { Modal } from "./Modal";
import { disableInput, enableInput } from "./utils";

export type OpenModalProps = {
  closeOnClickOutside?: boolean;
  showBox?: boolean;
  showHeader?: boolean;
  showCloseButton?: boolean;
  addBackdrop?: boolean;
  className?: string;
  title?: string;
  onClose?: (returnObj?: unknown)=> Promise<void> | void;
  onBeforeClose?: ()=> Promise<boolean> | boolean;
  onOpen?: ()=> void;
  content?: ReactNode;
};

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

type ModalElements = {
  modal: HTMLDivElement | null;
  backdrop: HTMLDivElement | null;
};

export const ModalProvider = ( { children }: { children: ReactNode } ) => {
  const [modals, setModals] = useState<ModalInstance[]>([]);
  const modalRefs = useRef<Record<string, ModalElements>>( {} );
  const _open = useCallback((id: string, options: OpenModalProps) => {
    if (modals.length === 0)
      disableInput();

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

    if (modals.length === 0)
      enableInput();

    // Limpieza de referencias
    if (modalRefs.current[id])
      delete modalRefs.current[id];

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
  const handleRequestClose = useCallback(async (id: string, returnObj?: unknown) => {
    const modalInstance = modals.find((m) => m.id === id);

    if (!modalInstance)
      return;

    // Si existe onBeforeClose, lo ejecutamos
    if (modalInstance.options.onBeforeClose) {
      const shouldClose = await modalInstance.options.onBeforeClose();

      // Si devuelve false, detenemos el cierre aquí
      if (shouldClose === false)
        return;
    }

    // Si pasa la validación (o no tiene), cerramos de verdad
    await _close(id, returnObj);
  }, [modals, _close]);
  const handleRequestDone = useCallback(async (id: string, returnObj?: unknown) => {
    const refs = modalRefs.current[id];
    const modalElement = refs?.modal;
    const backdropElement = refs?.backdrop;

    if (!modalElement)
      return;

    const active = document.activeElement as HTMLElement | null;

    // Si hay un elemento con foco y es interactivo, no hacemos nada
    if (
      active
      && active !== document.body
      && active !== backdropElement
      && active !== modalElement
    )
      return;

    const forms = modalElement.querySelectorAll("form");

    // Solo si hay exactamente un form
    if (forms.length !== 1)
      return;

    const form = forms[0];
    const submitters = Array.from(
      form.querySelectorAll("button[type=\"submit\"]"),
    ) as HTMLButtonElement[];

    if (submitters.length !== 1 || submitters[0].disabled)
      return;

    // Disparo de submit estándar (respeta onSubmit, validaciones, etc.)
    if (typeof form.requestSubmit === "function")
      form.requestSubmit();
    else {
      // Fallback para navegadores antiguos
      form.dispatchEvent(
        new Event("submit", {
          bubbles: true,
          cancelable: true,
        } ),
      );
    }

    await _close(id, returnObj);
  }, [modals, _close]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (modals.length > 0) {
        if (e.key === "Escape") {
          const topModal = modals[modals.length - 1];

          // Llamamos al intermediario en lugar de a _close directo
          await handleRequestClose(topModal.id);
        } else if (e.key === "Enter") {
          const topModal = modals[modals.length - 1];

          await handleRequestDone(topModal.id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modals, handleRequestClose, handleRequestDone]);

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
          onClose={(ret) => handleRequestClose(modal.id, ret)}
          closeOnClickOutside={modal.options.closeOnClickOutside}
          showCloseButton={modal.options.showCloseButton}
          showHeader={modal.options.showHeader}
          showBox={modal.options.showBox}
          addBackdrop={modal.options.addBackdrop}
          className={modal.options.className}
          onRefs={(refs) => {
            modalRefs.current[modal.id] = refs;
          }}
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
