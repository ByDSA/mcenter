"use client";

import { assertIsDefined } from "$shared/utils/validation";
import { createContext, useContext, useCallback, ReactNode } from "react";

type SetData<T> = (fn: T[] | ((oldData: T[])=> T[]))=> void;

export type NewItemFn<T> = ((oldItem: T)=> T);

export type NewItem<T> = NewItemFn<T> | T;

interface ArrayDataContextType<T> {
  data: T[];
  addItem: (item: T)=> void;
  removeItemByIndex: (index: number)=> void;
  setItemByIndex: (index: number, newItem: NewItem<T>)=> void;
  setData: SetData<T>;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const ArrayDataContext = createContext<ArrayDataContextType<any> | undefined>(undefined);

// Provider
type ArrayDataProviderProps<T> = Partial<Omit<ArrayDataContextType<T>, "data">> &
  Pick<ArrayDataContextType<T>, "data"> & {
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ArrayDataProvider = <T, >( { children,
  data,
  setData: _setData,
  removeItemByIndex: _removeItemByIndex,
  setItemByIndex: _setItemByIndex,
  addItem: _addItem }: ArrayDataProviderProps<T>): React.ReactNode => {
  const setData: SetData<T> = _setData ?? useCallback(()=> {
    throw new Error();
  }, []);
  // Agregar elemento
  const addItem = _addItem ?? useCallback((item: T) => {
    assertIsDefined(_setData);
    setData(prev => [...prev, item]);
  }, []);
  // Eliminar por índice
  const removeItemByIndex = _removeItemByIndex ?? useCallback((index: number) => {
    assertIsDefined(_setData);
    setData(prev => prev.filter((_, i) => i !== index));
  }, []);
  // Actualizar por índice
  const setItemByIndex = _setItemByIndex
    ?? useCallback((index: number, newItem: NewItem<T>) => {
      assertIsDefined(_setData);

      if (typeof newItem === "function") {
        setData(
          prev => prev.map((item, i) => i === index ? (newItem as NewItemFn<T>)(prev[i]) : item),
        );
      } else
        setData(prev => prev.map((item, i) => i === index ? newItem : item));
    }, []);
  const value: ArrayDataContextType<T> = {
    data,
    addItem,
    removeItemByIndex,
    setItemByIndex,
    setData,
  };

  return (
    <ArrayDataContext.Provider value={value}>
      {children}
    </ArrayDataContext.Provider>
  );
};

export const useArrayData = <T, >(): ArrayDataContextType<T> => {
  const context = useContext(ArrayDataContext) as ArrayDataContextType<T> | undefined;

  if (context === undefined)
    throw new Error("useArrayData debe ser usado dentro de ArrayDataProvider");

  return context;
};
