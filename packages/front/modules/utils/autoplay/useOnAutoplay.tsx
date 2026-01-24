import { showError } from "$shared/utils/errors/showError";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRequireActiveAction } from "./useRequireActiveAction/useRequireActiveAction";

type Props<T> = {
  data: T;
  play: (d: NonNullable<T>)=> Promise<void> | void;
};
export const useOnAutoplay = <T, >( { play, data }: Props<T>) => {
  const { action } = useRequireActiveAction( {
    action: ()=>play(data!),
  } );
  const queryParams = useSearchParams();

  useEffect(()=> {
    if (data && queryParams.get("autoplay") === "1")
      action().catch(showError);
  }, [data]);
};
