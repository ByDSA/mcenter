import clone from "just-clone";
import { useState, useEffect, useMemo } from "react";
import { useObserver } from "#modules/ui-kit/input/InputCommon";
import { Op } from "./UseCrudComps/op";

export type AddOnReset<R> = (fn: OnReset<R>)=> void;
type OnReset<R> = (resource: R)=> void;
export type SetState<T> = ReturnType<typeof useState<T>>[1];

export const createFullOp = <R, P, >(op: Op<R, P>)=>async () => {
  let param: P;

  if (op.beforeAction) {
    const beforeActionRet = await op.beforeAction();

    if (!beforeActionRet.shouldDo) {
      return {
        data: undefined,
        success: false,
      };
    }

    param = beforeActionRet.param;
  }

  const obj = await op.action(param!);

  if (op.afterAction)
    await op.afterAction(obj);

  return {
    data: obj,
    success: true,
  };
};

export type UseCrudProps<T> = {
  data: T;
  isModifiedFn?: (base: T, current: T)=> boolean;
};

export type CrudOp<T, P> = {
  op: Op<T, P>;
  isDoing: boolean;
};

function useCrudState<T>(
  data: T,
) {
  const [initialData, setInitialData] = useState<T>(data);
  const [currentData, setCurrentData] = useState<T>(() => typeof initialData === "object"
    && initialData !== null
    ? clone(initialData)
    : initialData);
  const { addObserver: addOnReset, handle: handleOnReset } = useObserver<[T]>();
  // eslint-disable-next-line require-await
  const reset = async (newData?: T) => {
    const target = newData ?? initialData;

    setCurrentData(
      typeof target === "object" && target !== null ? clone(target) : target,
    );

    if (newData)
      setInitialData(target);

    handleOnReset(target);
  };

  return {
    initialDataState: [initialData, setInitialData] as const,
    currentData,
    setCurrentData,
    reset,
    addOnReset,
  };
}

type UseIsDiferentProps<T> = {
  isModifiedFn: (current: T, initial: T)=> boolean;
  initialData: T;
  currentData: T;
  setInitialData: (newInitialData: T)=> void;
  dataProp: T;
};
function useIsModified<T>(props: UseIsDiferentProps<T>) {
  const { currentData,
    initialData,
    dataProp,
    setInitialData,
    isModifiedFn } = props;

  useEffect(() => {
    const areDifferent = isModifiedFn(dataProp, initialData);

    if (areDifferent)
      setInitialData(dataProp);
  }, [dataProp]);

  const isModified = useMemo(() => {
    return isModifiedFn(initialData, currentData);
  }, [initialData, currentData, isModifiedFn]);

  return isModified;
}

export function useCrud<T>( { data,
  isModifiedFn = (
    current,
    initial,
  ) => JSON.stringify(current) !== JSON.stringify(initial) }: UseCrudProps<T>) {
  const { initialDataState,
    currentData,
    setCurrentData,
    addOnReset,
    reset } = useCrudState(data);
  const isModified = useIsModified( {
    currentData,
    initialData: initialDataState[0],
    setInitialData: initialDataState[1],
    isModifiedFn,
    dataProp: data,
  } );

  return {
    isModified,
    reset,
    addOnReset,
    currentData,
    setCurrentData,
    initialState: initialDataState[0],
  };
}
