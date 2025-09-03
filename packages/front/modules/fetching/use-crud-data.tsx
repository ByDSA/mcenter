import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";

export type Action<D> = {
  fn: (data: D | null)=> Promise<D>;
};

type BaseProps<D> = {
  initialFetch?: (data: D | null)=> Promise<D>;
  refetching?: Action<D> & {
    everyMs?: number;
  };
};

type ExecutableCustomActions<T> = {
  [K in keyof T]: ()=> Promise<void>;
};

export type Props<D, T extends Record<string, Action<D>> | undefined = undefined> =
  T extends undefined
    ? BaseProps<D>
    : BaseProps<D> & { customActions: T };

// Return type condicional
type UseCrudDataReturn<
  D extends unknown[],
  T extends Record<string, Action<D>> | undefined = undefined
> = {
      customActions: ExecutableCustomActions<T>;
      refetchData: ()=> Promise<void>;
      fetchInitData: ()=> Promise<void>;
      data: D | null;
      setData: ReturnType<typeof useState<D | null>>[1];
      error: unknown | undefined;
      setError: (error: unknown | undefined)=> void;
      isLoading: boolean;
      setIsLoading: (loading: boolean)=> void;
      setItem: (i: number, item: D[0] | null)=> void;
    };

export function useCrudData<D extends unknown[], T extends Record<string, Action<D>> | undefined>(
  props: Props<D, T>,
): UseCrudDataReturn<D, T> {
  const { initialFetch, refetching } = props;
  const [data, setData] = useState<D | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | undefined>(undefined);
  const refetchDataRef = useRef<()=> Promise<void>>();
  const dataRef = useRef(data);
  const isRefetchingRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const refetchData = useCallback(async () => {
    const fn = refetching?.fn;

    if (!fn)
      return;

    const result = await fn(dataRef.current);

    isRefetchingRef.current = true;
    setData(result);
  }, [refetching]);
  // Definir fetchInitData como useCallback para que esté disponible externamente
  const fetchInitData = useCallback(async () => {
    const fn = initialFetch ?? refetching?.fn;

    if (!fn)
      return;

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await fn(dataRef.current);

      setData(result);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setError(e);

      if (isNetworkError(e)) {
        startRecoveryMode( {
          fn: fetchInitData,
        } );
      }
    }
  }, [initialFetch, refetching]);

  useEffect(() => {
    if (isRefetchingRef.current) {
      isRefetchingRef.current = false;

      return;
    }

    refetchDataRef.current?.()
      .catch(e => setError(e));
  }, [data]);

  refetchDataRef.current = refetchData;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    // eslint-disable-next-line require-await
    const onSuccess = async (result: D) => {
      setData(result);
      setIsLoading(false);

      if (props.refetching) {
        intervalId = setInterval(() => {
          refetchDataRef.current?.()
            .catch(e => setError(e));
        }, props.refetching.everyMs ?? 5_000);
      }
    };
    // Función interna que maneja el éxito
    const handleInitialFetch = async () => {
      const fn = initialFetch ?? refetching?.fn;

      if (!fn)
        return;

      const result = await fn(dataRef.current);

      return onSuccess(result);
    };

    handleInitialFetch()
      .catch(e => {
        setIsLoading(false);
        setError(e);

        if (isNetworkError(e)) {
          startRecoveryMode( {
            fn: fetchInitData,
          } );
        }
      } );

    return () => {
      if (intervalId)
        clearInterval(intervalId);
    };
  }, []);

  const setItem = useCallback((i: number, item: D[0] | null) => {
    setData((old: D | null) => {
      if (!old)
        return null;

      let newData = [...old];

      if (!item) {
        newData = [...newData.slice(0, i), ...newData.slice(i + 1)];

        return newData as D;
      }

      newData[i] = item;

      return newData as D;
    } );
  }, []);
  const customActions = "customActions" in props
    ? props.customActions as NonNullable<T>
    : {} as NonNullable<T>;
  const executableActions = useMemo(() => {
    const actions = {} as Record<keyof T, ()=> Promise<void>>;

    for (const [actionName, action] of Object.entries(customActions)) {
      actions[actionName as keyof T] = async () => {
        try {
          const result = await action.fn(dataRef.current);

          isRefetchingRef.current = true;
          setData(result);
        } catch (e) {
          setError(e);
        }
      };
    }

    return actions;
  }, [customActions]);

  return {
    refetchData,
    fetchInitData,
    data,
    setData,
    error,
    setError,
    isLoading,
    setIsLoading,
    setItem,
    customActions: executableActions,
  } as UseCrudDataReturn<D, T>;
}

export const isNetworkError = (error: unknown) => {
  if (!(error instanceof Error))
    return false;

  return error?.message?.includes("Failed to fetch")
  || error?.name === "NetworkError";
};

const checkConnectivity = async (url: string) => {
  try {
    await fetch(url, {
      method: "HEAD",
    } );

    return true;
  } catch {
    logger.debug("Connectivity check failed");

    return false;
  }
};
let recoveryInterval: NodeJS.Timeout | null = null;

type RetryProps = {
  fn: ()=> Promise<void>;
  healthyUrl?: string;
};

const startRecoveryMode = ( { fn, healthyUrl = backendUrl("") }: RetryProps) => {
  if (recoveryInterval)
    return; // Ya está en modo recovery

  recoveryInterval = setInterval(async () => {
    await retry( {
      fn,
      healthyUrl,
    } );
  }, 1000);
};
const retry = async ( { fn, healthyUrl = backendUrl("") }: RetryProps) => {
  if (await checkConnectivity(healthyUrl)) {
    await fn()
      .then(() => {
        if (recoveryInterval) {
          clearInterval(recoveryInterval);
          recoveryInterval = null;
        }
      } );
  }
};
