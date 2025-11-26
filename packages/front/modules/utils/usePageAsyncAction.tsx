import { ReactNode, useState, useEffect } from "react";
import { PageSpinner, Spinner } from "#modules/ui-kit/spinner/Spinner";

type Status = "error" | "iddle" | "loading" | "success";

type Props = {
  action: ()=> Promise<void>;
  autoStart?: boolean;
  loadingElement?: ReactNode;
  errorElement?: ReactNode;
  initialStatus?: Status;
};
export function usePageAsyncAction(
  { action,
    autoStart = true, loadingElement: loadingMessage,
    errorElement: errorMessage,
    initialStatus }: Props,
) {
  return useAsyncAction( {
    action,
    autoStart,
    initialStatus,
    loadingElement: <div>
      {loadingMessage ?? "Loading..."}
      <PageSpinner />
    </div>,
    errorElement: <div>
      {errorMessage ?? "Error"}
    </div>,
  } );
}

export function useAsyncAction(
  { action, autoStart = true,
    loadingElement: loading,
    errorElement: error,
    initialStatus }: Props,
) {
  const [status, setStatus] = useState<Status>(initialStatus ?? (autoStart ? "loading" : "iddle"));
  const start = (force?: boolean) => {
    if (status === "loading" && !force)
      return;

    setStatus("loading");
    action()
      .then(() => setStatus("success"))
      .catch(()=> setStatus("error"));
  };

  useEffect(() => {
    if (autoStart)
      start(true);
  }, []);

  let element: ReactNode;

  if (status === "loading")
    element = loading ?? <Spinner />;
  else if (status === "error")
    element = error ?? <span>Error</span>;

  return {
    element,
    start,
  };
}

export function useAsyncElement(
  props: Omit<Props, "autoStart"> & {
    renderElement: ()=> ReactNode;
  },
) {
  const { element } = useAsyncAction( {
    loadingElement: <span style={{
      display: "inline-flex",
      padding: "0 0.5em",
    }}>
      <Spinner />
    </span>,
    ...props,
    autoStart: true,
  } );

  return {
    element: element ?? props.renderElement(),
  };
}
