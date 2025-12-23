/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext, useState, ReactNode, JSX } from "react";
import { sleep } from "$shared/utils/sleep";
import { createPortal } from "react-dom";
import { PlayerFullscreenView } from "../../Fullscreen/FullscreenView";
import { PlayerWindowView } from "./Window";

type WindowContextType = {
  mountNode: JSX.Element;
  open: (props: {
    content: ReactNode;
    className?: string;
    fullscreen?: boolean;
  } )=> Promise<void>;
  close: ()=> Promise<void>;
  isOpen: boolean;
  isFullscreen: boolean;
};

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider = ( { children }: { children: ReactNode } ) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [windowMountNode, setWindowMountNode] = useState<HTMLSpanElement | null>(null);
  const [config, setConfig] = useState<Parameters<WindowContextType["open"]>[0] | null>(null);
  const open: WindowContextType["open"] = async (props) => {
    setConfig(props);
    await setIsOpen(true);
  };
  const close = async () => {
    setIsClosing(true);
    await sleep(200);
    setIsClosing(false);
    setIsOpen(false);
    setConfig(null);
  };
  const value: WindowContextType = {
    mountNode: <span ref={setWindowMountNode}></span>,
    open,
    close,
    isOpen,
    isFullscreen: !!config?.fullscreen,
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
