"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { SetState } from "./resources/useCrud";

// 1. Definimos una constante para cuando no se usa key
const DEFAULT_KEY = "default_context_key";

// La forma de la data individual
interface LocalDataValue<T> {
  data: T;
  setData?: SetState<T>;
}

type LocalContextRegistry = Record<string, LocalDataValue<any>>;

// eslint-disable-next-line @typescript-eslint/naming-convention
const LocalDataContext = createContext<LocalContextRegistry | undefined>(undefined);

type LocalDataProviderProps<T> = LocalDataValue<T> & {
  children: ReactNode;
  dataKey?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LocalDataProvider = <T, >( { children,
  data,
  setData,
  dataKey = DEFAULT_KEY }: LocalDataProviderProps<T>): React.ReactNode => {
  const parentRegistry = useContext(LocalDataContext);
  const value = useMemo(() => {
    const currentEntry: LocalDataValue<T> = {
      data,
      setData,
    };

    return {
      ...parentRegistry,
      [dataKey]: currentEntry,
    };
  }, [parentRegistry, data, setData, dataKey]);

  return (
    <LocalDataContext.Provider value={value}>
      {children}
    </LocalDataContext.Provider>
  );
};

// 4. Hook modificado para buscar por Key
export const useLocalData = <T, >(key: string = DEFAULT_KEY): LocalDataValue<T> => {
  const registry = useContext(LocalDataContext);

  if (registry === undefined)
    throw new Error("useLocalData debe ser usado dentro de LocalDataProvider");

  // Buscamos la data específica en el registro
  const contextValue = registry[key];

  if (!contextValue) {
    // Opcional: Lanzar error si se intenta acceder a una key que no existe en el árbol
    throw new Error(`No se encontró un LocalDataProvider para la key: "${key}"`);
  }

  return contextValue as LocalDataValue<T>;
};
