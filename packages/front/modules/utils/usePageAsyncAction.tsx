import { ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import { ContentSpinner, Spinner } from "#modules/ui-kit/spinner/Spinner";

type Status = "error" | "iddle" | "loading" | "success";

export type Props<T> = {
  action: ()=> Promise<T>;
  autoStart?: boolean;
  loadingElement?: ReactNode;
  errorElement?: ReactNode;
  initialStatus?: Status;
  onSuccess?: (data: T)=> void;
};

export function usePageAsyncAction<T>(
  { action,
    autoStart = true, loadingElement: loadingMessage,
    errorElement: errorMessage,
    onSuccess,
    initialStatus }: Props<T>,
) {
  return useAsyncAction( {
    action,
    autoStart,
    onSuccess,
    initialStatus,
    loadingElement: <div>
      {loadingMessage ?? "Loading..."}
      <ContentSpinner />
    </div>,
    errorElement: <div>
      {errorMessage ?? "Error"}
    </div>,
  } );
}

export function useAsyncAction<T>(
  { action, autoStart = true,
    loadingElement: loading,
    errorElement: error,
    initialStatus, onSuccess }: Props<T>,
) {
  const [status, setStatus] = useState<Status>(initialStatus ?? (autoStart ? "loading" : "iddle"));
  const start = useCallback((force?: boolean) => {
    if (status === "loading" && !force)
      return;

    setStatus("loading");
    action()
      .then((r) => {
        onSuccess?.(r);
        setStatus("success");
      } )
      .catch(()=> setStatus("error"));
  }, [action, setStatus, status]);

  useEffect(() => {
    if (autoStart)
      start(true);
  }, []);

  let statusElement = useMemo(()=> {
    if (status === "loading")
      return loading ?? <Spinner />;
    else if (status === "error")
      return error ?? <span>Error</span>;
  }, [status]);

  return {
    status,
    statusElement,
    start,
  };
}
