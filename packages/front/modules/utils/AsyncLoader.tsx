import { ReactNode } from "react";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { Props, useAsyncAction } from "./usePageAsyncAction";

type AsyncElementProps<T> = Omit<Props<T>, "autoStart" | "initialStatus"> & {
  children: ReactNode;
};
export const AsyncLoader = <T, >( { children, loadingElement, ...props }: AsyncElementProps<T>) => {
  const { statusElement, status } = useAsyncAction( {
    loadingElement: loadingElement ?? <ContentSpinner size={4}/>,
    ...props,
    autoStart: true,
  } );

  if (status === "success")
    return children;

  return statusElement;
};
