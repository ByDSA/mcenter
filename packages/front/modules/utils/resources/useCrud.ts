import clone from "just-clone";
import React, { useEffect, useState } from "react";
import { useAsyncAction } from "#modules/ui-kit/input";

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
  reset: ()=> Promise<void>;
  state: [T, React.Dispatch<React.SetStateAction<T>>];
};

export function useCrud<T>(
  { data, isModifiedFn, fetchRemove, fetchUpdate }: UseCrudProps<T>,
): UseCrudRet<T> {
  const initialData = useResourceBase(data, isModifiedFn);
  const dataState = useState(typeof initialData === "object" && initialData !== null ? clone(initialData) : initialData);
  const [currentData, setData] = dataState;
  const isModified = useIsModified(initialData, currentData, isModifiedFn);
  const asyncUpdateAction = useAsyncAction();
  const asyncRemoveAction = useAsyncAction();
  // eslint-disable-next-line require-await
  const reset = async () => {
    setData(data);
  };
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
    reset,
    state: dataState,
  };

  return ret;
}

type CompareFn<T> = (r1: T, r2: T)=> boolean;
function useResourceBase<T>(data: T, compare: CompareFn<T>) {
  const [resourceBase, setResourceBase] = React.useState(data);

  useEffect(() => {
    if (compare(data, resourceBase))
      setResourceBase(data);
  }, [data]);

  return resourceBase;
}

function useIsModified<T>(base: T, current: T, compare: CompareFn<T>) {
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const v = compare(base, current);

    setIsModified(v);
  }, [base, current]);

  return isModified;
}
