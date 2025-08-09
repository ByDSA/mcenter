import clone from "just-clone";
import React, { useEffect, useState } from "react";
import { useAsyncAction } from "#modules/ui-kit/input";
import { ResourceState } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { useObserver } from "#modules/ui-kit/input/InputCommon";

export type AddOnReset<R> = (fn: OnReset<R>)=> void;

type OnReset<R> = (resource: R)=> void;

type FetchFn<T> = ()=> Promise<T | void>;

export type UseCrudProps<T> = {
  data: T;
  setData: (newData: T | undefined)=> void;
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
  { data, setData: setResponseData, isModifiedFn, fetchRemove, fetchUpdate }: UseCrudProps<T>,
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
  const { addObserver: addOnReset, handle: handleOnReset } = useObserver<[T]>();
  // eslint-disable-next-line require-await
  const genReset = (initData: T) => async () => {
    setData(initData);

    handleOnReset(initData);
  };
  const update = async () => {
    if (!isModified)
      return;

    const { done, start } = asyncUpdateAction;

    start();

    return await fetchUpdate()
      .then(async (r)=>{
        if (r) {
          initialDataState[1](r);
          setResponseData(r);
          await genReset(r)();
        }

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

        setResponseData(undefined);

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

    reset: genReset(initialData),
    addOnReset,
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
