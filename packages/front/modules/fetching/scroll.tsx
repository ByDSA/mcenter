import { useRef, useEffect } from "react";
import { Action, Props as UseCrudDataProps, isNetworkError, useCrudData } from "./use-crud-data";

type Props<D extends unknown[]> = Pick<
  ReturnType<typeof useCrudData<D, any>>,
 "isLoading" | "setError" | "setIsLoading"> & {
  fetchScrollData: ()=> Promise<void>;
 };
export function useScrollData<D extends unknown[]>( { setIsLoading,
  isLoading,
  setError,
  fetchScrollData }: Props<D>) {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && !isLoading) {
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

      if (!current)
        return result;

      return ([...current, ...result] as unknown as D);
    },
  };
  const { data, setData, isLoading, error,
    setItem, setError, setIsLoading, customActions } = useCrudData(
    {
      ...props,
      customActions: {
        ...("customActions" in props ? props.customActions : {} ),
        fetchScrollData,
      },
    },
  );
  const { observerTarget } = useScrollData( {
    fetchScrollData: customActions.fetchScrollData,
    isLoading,
    setError,
    setIsLoading,
  } );

  return {
    customActions,
    data,
    setData,
    setItem,
    error,
    isLoading,
    observerTarget,
  };
}
