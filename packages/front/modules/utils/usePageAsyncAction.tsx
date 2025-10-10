import { PageSpinner } from "#modules/ui-kit/spinner/Spinner";
import { ReactNode, useState, useEffect } from "react";

type Props = {
  action: ()=> Promise<void>;
  autoStart?: boolean;
  loadingMessage?: ReactNode;
  errorMessage?: ReactNode;
};
export function usePageAsyncAction( { action, autoStart, loadingMessage, errorMessage }: Props) {
  const [status, setStatus] = useState<"error" | "iddle" | "loading">("iddle");
  const start = () => {
    if (status === "loading")
      return;

    setStatus("loading");
    action()
      .catch(()=> setStatus("error"));
  };

  useEffect(() => {
    if (autoStart)
      start();
  }, []);

  let element: ReactNode;

  if (status === "loading") {
    element = <div>
      {loadingMessage ?? "Loading..."}
      <PageSpinner />
    </div>;
  } else if (status === "error") {
    element = <div>
      {errorMessage ?? "Error"}
    </div>;
  }

  return {
    element,
    start,
  };
}
