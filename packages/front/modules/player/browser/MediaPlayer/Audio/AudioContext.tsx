/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext, useState } from "react";

type Obj = [
  HTMLAudioElement | null,
  (newValue: HTMLAudioElement | null)=> void
];

const AudioContext = createContext<Obj>(null!);

export const AudioProvider = ( { children } ) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  return (
    <AudioContext.Provider value={[
      audioElement,
      setAudioElement,
    ]}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioElement = () => {
  const context = useContext(AudioContext);

  if (context === undefined)
    throw new Error("useAudio debe usarse dentro de un AudioProvider");

  return context;
};
