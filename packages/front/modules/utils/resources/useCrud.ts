import clone from "just-clone";
import React, { useEffect, useState } from "react";
import { useAsyncAction } from "#modules/ui-kit/input";
import { ResourceState } from "#modules/ui-kit/input/ResourceInputCommonProps";

export type AddOnReset<R> = (fn: OnReset<R>)=> void;

type OnReset<R> = (resource: R)=> void;

type FetchFn<T> = ()=> Promise<T | void>;

export type UseCrudProps<T> = {
  data: T;
  isModifiedFn: (base: T, current: T)=> boolean;
  fetchUpdate: FetchFn<T>;
  fetchRemove: FetchFn<T>;
};

type CrudOp<T> = {
  action: ()=> Promise<T | void>;
  isDoing: boolean;
};

export type UseCrudRet<T> = {
  isModified: boolean;
  update: CrudOp<T>;
  remove: CrudOp<T>;
  addOnReset: AddOnReset<T>;
  reset: ()=> Promise<void>;
  state: ResourceState<T>;
  initialState: ResourceState<T>;
};

export function useCrud<T>(
  { data, isModifiedFn, fetchRemove, fetchUpdate }: UseCrudProps<T>,
): UseCrudRet<T> {
  const initialDataState = useInitialData(data, isModifiedFn);
  const [initialData] = initialDataState;
  const dataState = useState(
    typeof initialData === "object" && initialData !== null
      ? clone(initialData)
      : initialData,
  );
  const [currentData, setData] = dataState;
  const [isModified] = useIsModified(initialData, currentData, isModifiedFn);
  const asyncUpdateAction = useAsyncAction();
  const asyncRemoveAction = useAsyncAction();
  const [onReset, setOnReset] = useState([] as OnReset<T>[]);
  const update = async () => {
    if (!isModified)
      return;

    const { done, start } = asyncUpdateAction;

    start();

    return await fetchUpdate()
      .then((r)=>{
        done();

        return r;
      } );
  };
  const remove = async () => {
    const { done, start } = asyncUpdateAction;

    start();

    return await fetchRemove()
      .then((r)=>{
        done();

        return r;
      } );
  };
  const ret: UseCrudRet<T> = {
    isModified,
    update: {
      action: update,
      isDoing: asyncUpdateAction.isDoing,
    },
    remove: {
      action: remove,
      isDoing: asyncRemoveAction.isDoing,
    },
    // eslint-disable-next-line require-await
    reset: async () => {
      setData(initialData);

      for (const fn of onReset)
        fn(initialData);
    },
    addOnReset: (fn: OnReset<T>) => {
      setOnReset((oldOnReset)=>([
        ...oldOnReset,
        fn,
      ]));
    },
    state: dataState,
    initialState: initialDataState,
  };

  return ret;
}

type CompareFn<T> = (r1: T, r2: T)=> boolean;
function useInitialData<T>(data: T, compare: CompareFn<T>) {
  const [initialData, setInitialData] = React.useState(data);

  useEffect(() => {
    if (compare(data, initialData))
      setInitialData(data);
  }, [data]);

  return [
    initialData,
    setInitialData,
  ] as const;
}

function useIsModified<T>(base: T, current: T, compare: CompareFn<T>) {
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const v = compare(base, current);

    setIsModified(v);
  }, [base, current]);

  return [
    isModified,
    setIsModified,
  ] as const;
}
