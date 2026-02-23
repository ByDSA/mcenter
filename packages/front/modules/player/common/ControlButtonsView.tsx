"use client";

import { SkipPrevious,
  SkipNext,
  Replay10,
  Forward10,
  Stop,
  Shuffle,
  Repeat, RepeatOne,
  HighlightOff } from "@mui/icons-material";
import { ComponentProps } from "react";
import { classes } from "#modules/utils/styles";
import { RepeatMode } from "../browser/MediaPlayer/BrowserPlayerContext";
import styles from "./ControlButton.module.css";

export const ControlButtonView = ( { active = true,
  className,
  children,
  onMouseDown,
  onClick,
  ...props }: ComponentProps<"button"> & {
  active?: boolean;
} ) => {
  return (
    <button
      {...props}
      onClick={onClick
        ? (e) => {
          e.stopPropagation();
          onClick(e);
        }
        : undefined}
      onMouseDown={(e)=> {
        e.preventDefault(); // Para evitar que se quede el foco tras hacer click
        onMouseDown?.(e);
      }}
      className={classes(styles.controlButton, active ? styles.active : styles.inactive, className)}
    >
      {children}
    </button>
  );
};

type ControlButtonProps = Omit<ComponentProps<typeof ControlButtonView>, "children" | "title">;
export const PrevButtonView = ( { ...props }: ControlButtonProps) => {
  return (
    <ControlButtonView
      {...props}
      title="Anterior"
    >
      <SkipPrevious />
    </ControlButtonView>
  );
};

export const NextButtonView = ( { onClick, ...props }: ControlButtonProps) => {
  return (
    <ControlButtonView
      title="Siguiente"
      {...props}
    >
      <SkipNext />
    </ControlButtonView>
  );
};

export const BackwardButtonView = ( { ...props }: Omit<ControlButtonProps, "title">) => {
  return (
    <ControlButtonView
      {...props}
      title="Ir atrás 10 segundos"
    >
      <Replay10 />
    </ControlButtonView>
  );
};

export const ForwardButtonView = ( { ...props }: Omit<ControlButtonProps, "title">) => {
  return (
    <ControlButtonView
      {...props}
      title="Ir adelante 10 segundos"
    >
      <Forward10 />
    </ControlButtonView>
  );
};

export const StopButtonView = ( { onClick, ...props }: Omit<ControlButtonProps, "title">) => {
  return (
    <ControlButtonView
      {...props}
      title="Detener"
    >
      <Stop />
    </ControlButtonView>
  );
};

type RepeatProps = Omit<ControlButtonProps, "active" | "onClick" | "title"> & {
  repeatMode: RepeatMode;
  onClick?: (currentRepeatMode: RepeatMode)=> Promise<void> | void;
};
export const RepeatButtonView = ( { repeatMode, onClick, ...props }: RepeatProps) => {
  return (
    <ControlButtonView
      {...props}
      active={repeatMode !== RepeatMode.Off}
      title="Repetición"
      onClick={()=>onClick?.(repeatMode)}
    >
      {repeatMode === RepeatMode.One ? <RepeatOne fontSize="small" /> : <Repeat fontSize="small" />}
    </ControlButtonView>
  );
};

type ShuffleProps = Omit<ControlButtonProps, "active" | "onClick" | "title"> & {
  isShuffle: boolean;
  onClick?: (currentIsShuffle: boolean)=> Promise<void> | void;
};
export const ShuffleButtonView = ( { isShuffle, onClick, ...props }: ShuffleProps) => {
  return (
    <ControlButtonView
      {...props}
      active={isShuffle}
      title="Aleatoriedad"
      onClick={()=>onClick?.(isShuffle)}
    >
      <Shuffle fontSize="small" />
    </ControlButtonView>
  );
};

export const CloseButtonView = ( { className, ...props }: Omit<ControlButtonProps, "title">) => {
  return <ControlButtonView
    {...props}
    className={classes(
      styles.closeButton,
      className,
    )}
    title="Cerrar"
  >
    <HighlightOff />
  </ControlButtonView>;
};
