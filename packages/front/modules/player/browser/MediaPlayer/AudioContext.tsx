/* eslint-disable @typescript-eslint/naming-convention */
import type { AudioRef } from "./AudioTag";
import { createContext, useContext, useRef } from "react";

const AudioContext = createContext<AudioRef>(null!);

export const AudioProvider = ( { children } ) => {
  const audioRef = useRef(null);

  return (
    <AudioContext.Provider value={audioRef}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioRef = () => {
  const context = useContext(AudioContext);

  if (context === undefined)
    throw new Error("useAudio debe usarse dentro de un AudioProvider");

  return context;
};
