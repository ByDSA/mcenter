"use client";

import { useState, ReactNode, useMemo } from "react";
import { Modal } from "./Modal";

export type UseModalProps = {
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  addBackdrop?: boolean;
  className?: string;
  title?: string;
  onClose?: (returnObj?: unknown)=> Promise<void> | void;
  onOpen?: ()=> void;
};

export function useModal(options: UseModalProps = {} ) {
  const [isOpen, setIsOpen] = useState(false);
  const [onCloseFns, setOnCloseFns] = useState<NonNullable<UseModalProps["onClose"]>[]>([]);
  const open = useMemo(()=>() => {
    setIsOpen(true);
    options.onOpen?.();
  }, [options, setIsOpen]);
  const close = async (returnObj?: any) => {
    setIsOpen(false);

    for (const fn of onCloseFns)
      await fn(returnObj);

    await options.onClose?.(returnObj);
  };
  const toggle = () => setIsOpen(prev => !prev);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ModalComponent = useMemo(()=>( { children }: { children: ReactNode } ) => (
    <Modal
      isOpen={isOpen}
      title={options.title}
      onClose={close}
      closeOnClickOutside={options.closeOnClickOutside}
      showCloseButton={options.showCloseButton}
      addBackdrop={options.addBackdrop}
      className={options.className}
    >
      {children}
    </Modal>
  ), [isOpen]);
  const addOnClose = useMemo(()=>(newOnClose: NonNullable<UseModalProps["onClose"]>) => {
    setOnCloseFns((fns) => [...fns, newOnClose]);
  }, [setOnCloseFns]);

  return {
    isOpen,
    open,
    close,
    addOnClose,
    toggle,
    Modal: ModalComponent,
  };
}
