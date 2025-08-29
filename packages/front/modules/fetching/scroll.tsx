import { useRef, useEffect, useState } from "react";
import { Action, Props as UseCrudDataProps, isNetworkError, useCrudData } from "./use-crud-data";

type Props<D extends unknown[]> = Pick<
  ReturnType<typeof useCrudData<D, any>>,
 "isLoading" | "setError" | "setIsLoading"> & {
  fetchScrollData: ()=> Promise<void>;
  disabled?: boolean;
 };
export function useScrollData<D extends unknown[]>( { setIsLoading,
  isLoading,
  disabled = false,
  setError,
  fetchScrollData }: Props<D>) {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && !isLoading && !disabled) {
          setIsLoading(true);
          fetchScrollData()
            .then(()=> {
              setIsLoading(false);
            } )
            .catch(e=>setError(e));
        }
      },
      {
        threshold: 1.0,
        rootMargin: "20px",
      },
    );

    if (observerTarget.current)
      observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current)
        observer.unobserve(observerTarget.current);
    };
  }, [isLoading]);

  return {
    observerTarget,
  };
}

export function useCrudDataWithScroll<
  D extends unknown[],
  T extends Record<string, Action<D>> | undefined
>(props: UseCrudDataProps<D, T> & {
  fetchingMore: Action<D>;
} ) {
  const [scrollDisabled, setScrollDisabled] = useState(false);
  const canCall = useRef(true);
  const fetchScrollData: Action<D> = {
    fn: async (current: D) => {
      if (!canCall.current)
        return current;

      canCall.current = false;
      setTimeout(()=> {
        canCall.current = true;
      }, 1_000);
      const result = await props.fetchingMore.fn(current);

      if (isNetworkError(error))
        setError(null);

      canCall.current = true;

      if (result.length === 0)
        setScrollDisabled(true);

      if (!current)
        return result;

      return ([...current, ...result] as unknown as D);
    },
  };
  const { data, setData, isLoading, error,
    setItem, setError, setIsLoading, customActions, fetchInitData } = useCrudData(
    {
      ...props,
      customActions: {
        ...("customActions" in props ? props.customActions : {} ),
        fetchScrollData,
      },
    },
  );

  useEffect(() => {
    setScrollDisabled(false);

    // Search id duplicates:
    const duplicates = data?.filter((item, index) => {
      if (!item || !data)
        return false;

      const firstIndex = data.findIndex(i=> (i as any)?.id === (item as any)?.id);

      return firstIndex !== index;
    } );

    if (duplicates && duplicates.length > 0)
      console.warn("Duplicate items in data:", duplicates);
  }, [data]);

  const { observerTarget } = useScrollData( {
    fetchScrollData: customActions.fetchScrollData,
    isLoading,
    setError,
    setIsLoading,
    disabled: scrollDisabled,
  } );

  return {
    customActions,
    data,
    fetchInitData,
    setData,
    setItem,
    error,
    isLoading,
    observerTarget,
  };
}
