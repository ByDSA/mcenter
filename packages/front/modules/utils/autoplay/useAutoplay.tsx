import { showError } from "$shared/utils/errors/showError";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRequireActiveAction } from "./useRequireActiveAction/useRequireActiveAction";

type UseAutoplayProps<T> = {
  play: (data: NonNullable<T>)=> Promise<void> | void;
  data: T;
};
export const useAutoplay = <T, >( { play, data }: UseAutoplayProps<T>) => {
  const { action } = useRequireActiveAction( {
    action: ()=>play(data!),
  } );
  const queryParams = useSearchParams();

  useEffect(()=> {
    if (data && queryParams.get("autoplay") === "1")
      action().catch(showError);
  }, [data]);
};
