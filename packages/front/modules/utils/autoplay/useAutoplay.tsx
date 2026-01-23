import { showError } from "$shared/utils/errors/showError";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRequireActiveAction } from "./useRequireActiveAction/useRequireActiveAction";

type UseAutoplayProps = {
  play: ()=> Promise<void> | void;
};
export const useAutoplay = ( { play }: UseAutoplayProps) => {
  const { action } = useRequireActiveAction( {
    action: ()=>play(),
  } );
  const queryParams = useSearchParams();

  useEffect(()=> {
    if (queryParams.get("autoplay") === "1")
      action().catch(showError);
  }, []);
};
